export type ApprovedAllowanceAmount = {
  currency: string
  module: string
  contractAddress: string
  allowance: string
}

export interface FreeCollectModuleParams {
  followerOnly: boolean
  type?: CollectModules.FreeCollectModule
}

export type FeeCollectModuleParams = {
  amount: {
    currency: string
    value: string
  }
  recipient: string
  referralFee: number
  followerOnly: boolean
  type?: CollectModules.FeeCollectModule
}

export type RevertCollectModuleParams = {
  revertCollectModule: boolean
  type?: CollectModules.RevertCollectModule
}

export type CommonFeeCollectModuleParams = {
  collectLimit: string
} & FeeCollectModuleParams
export type LimitedFeeCollectModuleParams = CommonFeeCollectModuleParams & {
  type?: CollectModules.LimitedFeeCollectModule
}
export type LimitedTimedFeeCollectModuleParams =
  CommonFeeCollectModuleParams & {
    type?: CollectModules.LimitedTimedFeeCollectModule
  }
export type TimedFeeCollectModuleParams = FeeCollectModuleParams & {
  type?: CollectModules.TimedFeeCollectModule
}

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

export enum CollectModules {
  FeeCollectModule = 'FeeCollectModule',
  FreeCollectModule = 'FreeCollectModule',
  LimitedFeeCollectModule = 'LimitedFeeCollectModule',
  LimitedTimedFeeCollectModule = 'LimitedTimedFeeCollectModule',
  RevertCollectModule = 'RevertCollectModule',
  TimedFeeCollectModule = 'TimedFeeCollectModule',
}
