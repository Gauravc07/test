import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CreatorProfileLoading() {
  return (
    <main className="min-h-screen bg-background">
      <Skeleton className="h-96 w-full mt-16" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-96" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full mb-4" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
