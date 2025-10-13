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
