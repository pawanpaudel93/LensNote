export interface FreeCollectModuleParams {
  followerOnly: boolean
}

export type FeeCollectModuleParams = {
  amount: {
    currency: string
    value: string
  }
  recipient: string
  referralFee: number
  followerOnly: boolean
}

export type CommonFeeCollectModuleParams = {
  collectLimit: string
} & FeeCollectModuleParams
export type LimitedFeeCollectModuleParams = CommonFeeCollectModuleParams
export type LimitedTimedFeeCollectModuleParams = CommonFeeCollectModuleParams
export type TimedFeeCollectModuleParams = FeeCollectModuleParams

export interface CollectModuleParams {
  // The collect free collect module
  freeCollectModule: FreeCollectModuleParams

  // The collect revert collect module
  revertCollectModule: boolean

  // The collect fee collect module
  feeCollectModule: FeeCollectModuleParams

  // The collect limited fee collect module
  limitedFeeCollectModule: LimitedFeeCollectModuleParams

  // The collect limited timed fee collect module
  limitedTimedFeeCollectModule: LimitedTimedFeeCollectModuleParams

  // The collect timed fee collect module
  timedFeeCollectModule: TimedFeeCollectModuleParams
}
