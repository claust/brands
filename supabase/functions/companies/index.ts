import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
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

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    // GET /companies/:id
    if (pathParts.length === 2 && pathParts[0] === 'companies') {
      const companyId = pathParts[1]
      
      // Get company details
      const { data: company, error: companyError } = await supabaseClient
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()
        
      if (companyError) {
        throw companyError
      }
      
      // Get brands
      const { data: brands, error: brandsError } = await supabaseClient
        .from('brands')
        .select('*')
        .eq('owner_id', companyId)
        .order('name')
        
      if (brandsError) {
        throw brandsError
      }
      
      // Get subsidiaries
      const { data: subsidiaries, error: subsidiariesError } = await supabaseClient
        .from('companies')
        .select('*')
        .eq('parent_id', companyId)
        .order('name')
        
      if (subsidiariesError) {
        throw subsidiariesError
      }
      
      return new Response(
        JSON.stringify({
          ...company,
          brands,
          subsidiaries
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    // GET /companies (list with pagination)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = (page - 1) * limit
    const search = url.searchParams.get('search')
    
    let query = supabaseClient
      .from('companies_with_counts')
      .select('*', { count: 'exact' })
    
    if (search) {
      query = query.or(`name.ilike.%${search}%`)
    }
    
    const { data, error, count } = await query
      .order('name')
      .range(offset, offset + limit - 1)
    
    if (error) {
      throw error
    }
    
    return new Response(
      JSON.stringify({
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil((count || 0) / limit)
        }
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