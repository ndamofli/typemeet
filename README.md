Typemeet
https://typemeet-one.vercel.app/

npm run dev
npm run inngest
npm run typecheck

npx supabase db reset --linked
npx supabase gen types typescript --project-id "ugcfzyyxafelqddbvuvp" --schema public > src/types/database.types.ts

# Installation steps
npx create-next-app@latest typemeet
npm install @clerk/nextjs
npm install @clerk/themes
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button
npm install inngest
npx supabase link
npx supabase db reset --linked
npm install openai


# To tranfer ownership
- Manage account / profile > Add new email > Delete old email > Update profile name last name, photo  > Remove connected accounts > Disconnect Active devices if any

# Pre launch
- Check Spend management on Vercel !!!!




//import { createSupabaseClient } from '@/lib/supabase'
//import { verifyWebhook } from '@clerk/backend/webhooks';
//import { NextRequest } from 'next/server';
/*

    case 'organization.created': {
      // Handle organization creation
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          id: event.data.id,
          name: event.data.name,
          created_at: new Date(event.data.created_at).toISOString(),
          updated_at: new Date(event.data.updated_at).toISOString(),
        }])
        .select()
        .single()

      if (error) {
        console.error('Error updating owner:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ data }), { status: 200 })
    }

    case 'organization.updated': {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          name: event.data.name,
          updated_at: new Date(event.data.updated_at).toISOString(),
        })
        .eq('id', event.data.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating owner:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ data }), { status: 200 })
    }

    case 'organizationMembership.created': {
      const { data, error } = await supabase
        .from('members')
        .insert([{
            id: event.data.id,
            user_id: event.data.public_user_data?.user_id,
            organization_id: event.data.organization?.id,
            created_at: new Date(event.data.created_at).toISOString(),
            updated_at: new Date(event.data.updated_at).toISOString(),
        }])
        .select()
        .single()

      if (error) {
        console.error('Error updating member:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ data }), { status: 200 })
    }

    case 'organizationMembership.updated': {
      const { data, error } = await supabase
        .from('members')
        .update({
          user_id: event.data.public_user_data?.user_id,
          organization_id: event.data.organization?.id,
          updated_at: new Date(event.data.updated_at).toISOString(),
        })
        .eq('id', event.data.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating member:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ data }), { status: 200 })
    }

    default: {
      // Unhandled event type
      console.log('Unhandled event type:', JSON.stringify(event, null, 2))
      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }
  }
  
}*/