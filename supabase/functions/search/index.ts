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
    const query = url.searchParams.get('q')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    
    // Search companies
    const { data: companies, error: companiesError } = await supabaseClient
      .from('companies')
      .select('id, name, parent_id')
      .ilike('name', `%${query}%`)
      .limit(limit)
      .order('name')
    
    if (companiesError) {
      throw companiesError
    }
    
    // Search brands
    const { data: brands, error: brandsError } = await supabaseClient
      .from('brands')
      .select(`
        id, 
        name, 
        category,
        company:companies!owner_id(id, name)
      `)
      .ilike('name', `%${query}%`)
      .limit(limit)
      .order('name')
    
    if (brandsError) {
      throw brandsError
    }
    
    return new Response(
      JSON.stringify({
        companies: companies.map(c => ({ ...c, type: 'company' })),
        brands: brands.map(b => ({ ...b, type: 'brand' })),
        total: companies.length + brands.length
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