import { FC } from 'react'
import Props from './Props'
import RequestDeviceSuccess from '../requestDeviceSuccess/RequestDeviceSuccess'

const RequestDeviceDone: FC<Props> = ({ result }) => {
  return (
    <>
      {result.success ? <RequestDeviceSuccess device={result.result} /> : result.result.toString()}
    </>
  )
}

export default RequestDeviceDone
