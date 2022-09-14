import { AlertStatus, ToastOptions, ToastPosition } from '@chakra-ui/react'

export const getDefaultToastOptions = (
  status: AlertStatus
): {
  position: ToastPosition
  status: AlertStatus
  duration: ToastOptions['duration']
  isClosable: boolean
} => ({
  position: 'top-right',
  status,
  duration: 9000,
  isClosable: true,
})
