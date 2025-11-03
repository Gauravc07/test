import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"

export default function BlogLoading() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Skeleton className="h-6 w-24 mx-auto mb-4" />
          <Skeleton className="h-12 w-full max-w-2xl mx-auto mb-6" />
          <Skeleton className="h-6 w-full max-w-xl mx-auto mb-8" />
          <Skeleton className="h-12 w-full max-w-xl mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-4 w-32" />
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
