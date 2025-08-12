import { useToast } from "./use-toast"
import { Button } from "./button"

export function ToastDemo() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "Scheduled: Catch up ",
          description: "Friday, February 10, 2023 at 5:57 PM",
        })
      }}
    >
      Add to calendar
    </Button>
  )
}


