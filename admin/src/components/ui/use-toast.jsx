import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

const DURATION = 5000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

let timerRef = null

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST:
      const { toastId } = action

      // ! Side effects ! - This means all toasts will be dismissed.
      // TODO: Makes the animation feel a bit choppy - would be nice all to go at the same time.
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId ? { ...t, open: false } : t
          ),
        }
      } else {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({ ...t, open: false })),
        }
      }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      throw new Error()
  }
}

const ToastContext = React.createContext(null)

function ToastContextProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] })

  const hotkey = ["keydown", "keyup"]

  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        dispatch({ type: actionTypes.DISMISS_TOAST })
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const addToast = React.useCallback(
    function addToast(toast) {
      const id = genId()
      dispatch({ type: actionTypes.ADD_TOAST, toast: { ...toast, id } })
    },
    [dispatch]
  )

  const updateToast = React.useCallback(
    function updateToast(toast) {
      dispatch({ type: actionTypes.UPDATE_TOAST, toast })
    },
    [dispatch]
  )

  const dismissToast = React.useCallback(
    function dismissToast(toastId) {
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
    },
    [dispatch]
  )

  const removeToast = React.useCallback(
    function removeToast(toastId) {
      dispatch({ type: actionTypes.REMOVE_TOAST, toastId })
    },
    [dispatch]
  )

  return (
    <ToastContext.Provider
      value={React.useMemo(
        () => ({
          toast: addToast,
          update: updateToast,
          dismiss: dismissToast,
          toasts: state.toasts,
        }),
        [addToast, updateToast, dismissToast, state.toasts]
      )}
    >
      {children}
    </ToastContext.Provider>
  )
}

function useToast() {
  const context = React.useContext(ToastContext)
  if (context === null) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export { useToast, ToastContextProvider as ToastProvider }


