// Using Deno.serve() which is now built-in and more reliable
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get total counts
    const { count: companiesCount } = await supabaseClient
      .from('companies')
      .select('*', { count: 'exact', head: true })
      
    const { count: brandsCount } = await supabaseClient
      .from('brands')
      .select('*', { count: 'exact', head: true })
    
    // Get category distribution
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('brands')
      .select('category')
      
    if (categoriesError) {
      throw categoriesError
    }
    
    // Count brands per category
    const categoryStats = categories.reduce((acc, { category }) => {
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Get top companies by brand count
    const { data: topCompanies, error: topError } = await supabaseClient
      .from('companies_with_counts')
      .select('id, name, brand_count, subsidiary_count')
      .order('brand_count', { ascending: false })
      .limit(10)
      
    if (topError) {
      throw topError
    }
    
    // Get parent companies (market concentration)
    const { data: parentCompanies, error: parentError } = await supabaseClient
      .from('companies')
      .select('id')
      .is('parent_id', null)
      
    if (parentError) {
      throw parentError
    }
    
    return new Response(
      JSON.stringify({
        totalCompanies: companiesCount || 0,
        totalBrands: brandsCount || 0,
        parentCompanies: parentCompanies?.length || 0,
        categoryDistribution: categoryStats,
        topCompanies,
        averageBrandsPerCompany: companiesCount ? Math.round((brandsCount || 0) / companiesCount * 10) / 10 : 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})