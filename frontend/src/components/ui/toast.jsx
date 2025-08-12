import * as React from "react"
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction } from "@radix-ui/react-toast"
import { cn } from "@/lib/utils"
import { useToast } from "./use-toast"

const ToastContext = React.createContext(undefined)

const ToastProviderComponent = ({ children }) => {
  const [state, setState] = React.useState([])
  const addToast = React.useCallback((toast) => {
    setState((prev) => [...prev, toast])
  }, [])
  const removeToast = React.useCallback((id) => {
    setState((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const value = React.useMemo(() => ({ addToast, removeToast }), [addToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastProvider>
        {state.map(({ id, title, description, action, ...props }) => (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

const useToastContext = () => {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProviderComponent")
  }
  return context
}

export { ToastProviderComponent, useToastContext }



