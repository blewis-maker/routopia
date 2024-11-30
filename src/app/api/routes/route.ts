import { authenticatedRoute } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const GET = authenticatedRoute(async (req: Request, session: any) => {
  const routes = await prisma.route.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      nodes: true,
      activityRoute: true,
    }
  })
  return Response.json(routes)
})

export const POST = authenticatedRoute(async (req: Request, session: any) => {
  const data = await req.json()
  const route = await prisma.route.create({
    data: {
      ...data,
      userId: session.user.id,
    }
  })
  return Response.json(route)
}) 