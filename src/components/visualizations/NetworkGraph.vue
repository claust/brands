<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import * as d3 from 'd3'
import { useBrandStore } from '@/stores/brandStore'
import { getBrandLogoPath } from '@/utils/logoUtils'

const brandStore = useBrandStore()
const svgRef = ref<SVGSVGElement | null>(null)
const selectedNodeId = ref<string | null>(null)

interface Node {
  id: string
  name: string
  type: 'company' | 'brand'
  category?: string
  level: number
  logoPath?: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  source: string | Node
  target: string | Node
}

const graphData = computed(() => {
  const nodes: Node[] = []
  const links: Link[] = []

  // Add companies as nodes
  brandStore.companies.forEach((company) => {
    nodes.push({
      id: company.id,
      name: company.name,
      type: 'company',
      level: company.parent_id ? 2 : 1
    })

    // Add links between companies
    if (company.parent_id) {
      links.push({
        source: company.parent_id,
        target: company.id
      })
    }
  })

  // Add brands as nodes
  brandStore.brands.forEach((brand) => {
    nodes.push({
      id: `brand-${brand.id}`,
      name: brand.name,
      type: 'brand',
      category: brand.category,
      level: 3,
      logoPath: getBrandLogoPath(brand.name, 1)
    })

    links.push({
      source: brand.owner_id,
      target: `brand-${brand.id}`
    })
  })

  return { nodes, links }
})

function initializeGraph() {
  if (!svgRef.value) return

  const width = svgRef.value.clientWidth
  const height = svgRef.value.clientHeight

  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()

  const g = svg.append('g')

  // Create zoom behavior
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoom)

  // Create force simulation
  const simulation = d3
    .forceSimulation<Node>(graphData.value.nodes)
    .force(
      'link',
      d3
        .forceLink<Node, Link>(graphData.value.links)
        .id((d) => d.id)
        .distance((d) => {
          const source = d.source as Node
          const target = d.target as Node
          return source.type === 'company' && target.type === 'company' ? 150 : 100
        })
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30))

  // Create links
  const link = g
    .append('g')
    .selectAll('line')
    .data(graphData.value.links)
    .enter()
    .append('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', (d) => {
      const source =
        typeof d.source === 'object'
          ? d.source
          : graphData.value.nodes.find((n) => n.id === d.source)
      const target =
        typeof d.target === 'object'
          ? d.target
          : graphData.value.nodes.find((n) => n.id === d.target)
      return source?.type === 'company' && target?.type === 'company' ? 2 : 1
    })

  // Create nodes
  const node = g
    .append('g')
    .selectAll('g')
    .data(graphData.value.nodes)
    .enter()
    .append('g')
    .attr('cursor', 'pointer')
    .call(
      d3.drag<SVGGElement, Node>().on('start', dragstarted).on('drag', dragged).on('end', dragended)
    )

  // Add visual elements for nodes
  node.each(function(d) {
    const nodeGroup = d3.select(this)
    
    if (d.type === 'brand' && d.logoPath) {
      // Create circular clipping path for brand logos
      const clipId = `clip-${d.id.replace(/[^a-zA-Z0-9]/g, '')}`
      
      svg.append('defs')
        .append('clipPath')
        .attr('id', clipId)
        .append('circle')
        .attr('r', 12)
      
      // Add background circle
      nodeGroup
        .append('circle')
        .attr('r', 12)
        .attr('fill', '#ffffff')
        .attr('stroke', '#e5e5e5')
        .attr('stroke-width', 2)
      
      // Add logo image
      nodeGroup
        .append('image')
        .attr('href', d.logoPath)
        .attr('x', -10)
        .attr('y', -10)
        .attr('width', 20)
        .attr('height', 20)
        .attr('clip-path', `url(#${clipId})`)
        .on('error', function() {
          // Fallback to colored circle if logo fails to load
          d3.select(this).remove()
          nodeGroup.select('circle')
            .attr('fill', () => {
              const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
              return colorScale(d.category || '')
            })
        })
    } else {
      // Company nodes - use colored circles
      nodeGroup
        .append('circle')
        .attr('r', d.type === 'company' ? (d.level === 1 ? 12 : 10) : 8)
        .attr('fill', () => {
          if (d.type === 'company') {
            return d.level === 1 ? '#3b82f6' : '#60a5fa'
          }
          const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
          return colorScale(d.category || '')
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
    }
  })

  // Add labels
  node
    .append('text')
    .text((d) => d.name)
    .attr('x', (d) => (d.type === 'company' ? 15 : (d.type === 'brand' && d.logoPath ? 15 : 10)))
    .attr('y', 3)
    .attr('font-size', (d) => (d.type === 'company' ? '12px' : '10px'))
    .attr('font-weight', (d) => (d.type === 'company' && d.level === 1 ? 'bold' : 'normal'))
    .attr('fill', '#ffffff')
    .attr('stroke', '#000000')
    .attr('stroke-width', 0.5)
    .attr('paint-order', 'stroke')

  // Add hover effects
  node
    .on('mouseover', function (_event, d) {
      const circle = d3.select(this).select('circle')
      const image = d3.select(this).select('image')
      
      circle
        .transition()
        .duration(200)
        .attr('r', () => {
          const baseRadius = d.type === 'brand' && d.logoPath ? 12 : 
                            d.type === 'company' ? (d.level === 1 ? 12 : 10) : 8
          return baseRadius * 1.3
        })
      
      if (!image.empty()) {
        image
          .transition()
          .duration(200)
          .attr('x', -13)
          .attr('y', -13)
          .attr('width', 26)
          .attr('height', 26)
      }
    })
    .on('mouseout', function (_event, _d) {
      const circle = d3.select(this).select('circle')
      const image = d3.select(this).select('image')
      
      circle
        .transition()
        .duration(200)
        .attr('r', () => {
          return _d.type === 'brand' && _d.logoPath ? 12 : 
                 _d.type === 'company' ? (_d.level === 1 ? 12 : 10) : 8
        })
      
      if (!image.empty()) {
        image
          .transition()
          .duration(200)
          .attr('x', -10)
          .attr('y', -10)
          .attr('width', 20)
          .attr('height', 20)
      }
    })
    .on('click', (event, d) => {
      selectedNodeId.value = d.id
    })

  // Update positions on tick
  simulation.on('tick', () => {
    link
      .attr('x1', (d) => (d.source as Node).x!)
      .attr('y1', (d) => (d.source as Node).y!)
      .attr('x2', (d) => (d.target as Node).x!)
      .attr('y2', (d) => (d.target as Node).y!)

    node.attr('transform', (d) => `translate(${d.x},${d.y})`)
  })

  function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  // Initial zoom to fit
  setTimeout(() => {
    const bounds = g.node()?.getBBox()
    if (bounds) {
      const fullWidth = width
      const fullHeight = height
      const widthScale = fullWidth / bounds.width
      const heightScale = fullHeight / bounds.height
      const scale = Math.min(widthScale, heightScale) * 0.8
      const translate = [
        fullWidth / 2 - scale * (bounds.x + bounds.width / 2),
        fullHeight / 2 - scale * (bounds.y + bounds.height / 2)
      ]

      svg
        .transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
    }
  }, 1000)
}

onMounted(() => {
  initializeGraph()
})

watch(
  () => [brandStore.brands, brandStore.companies],
  () => {
    initializeGraph()
  },
  { deep: true }
)
</script>

<template>
  <div class="relative h-full w-full">
    <svg
      ref="svgRef"
      class="bg-background h-full w-full"
    />

    <!-- Legend -->
    <div class="bg-card absolute top-4 right-4 space-y-2 rounded-lg p-4 shadow-lg">
      <h3 class="mb-2 text-sm font-semibold">
        Legend
      </h3>
      <div class="flex items-center gap-2 text-sm">
        <div class="h-3 w-3 rounded-full bg-blue-600" />
        <span>Parent Company</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <div class="h-3 w-3 rounded-full bg-blue-400" />
        <span>Subsidiary</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <div class="h-3 w-3 rounded-full bg-white border border-gray-300" />
        <span>Brand (with logo)</span>
      </div>
    </div>

    <!-- Controls -->
    <div class="bg-card absolute bottom-4 left-4 rounded-lg p-2 shadow-lg">
      <p class="text-muted-foreground text-sm">
        Drag to pan • Scroll to zoom • Click nodes for details
      </p>
    </div>
  </div>
</template>
