import { storageEffect } from '@domains/common/effects'
import type { InjectedAccount } from '@polkadot/extension-inject/types'
import { array, jsonParser, object, optional, string } from '@recoiljs/refine'
import { ethers } from 'ethers'
import { DefaultValue, atom, selector, waitForAll } from 'recoil'

export type Account = InjectedAccount & {
  readonly?: boolean
}

export type ReadonlyAccount = Pick<Account, 'address' | 'name'>

export const injectedAccountsState = atom<Account[]>({
  key: 'InjectedAccounts',
  default: [],
})

export const injectedSubstrateAccountsState = selector({
  key: 'InjectedSubstrateAccountsState',
  get: ({ get }) => get(injectedAccountsState).filter(x => x.type !== 'ethereum'),
})

const _readOnlyAccountsState = atom<ReadonlyAccount[]>({
  key: 'readonly_accounts',
  default: [],
  effects: [
    storageEffect(localStorage, {
      parser: jsonParser(
        array(
          object({
            address: string(),
            name: optional(string()),
          })
        )
      ),
    }),
  ],
})

export const readOnlyAccountsState = selector<Account[]>({
  key: 'ReadonlyAccounts',
  get: ({ get }) => {
    const injectedAddresses = get(injectedAccountsState).map(x => x.address)
    return get(_readOnlyAccountsState)
      .filter(x => !injectedAddresses.includes(x.address))
      .map(x => ({ ...x, readonly: true, type: ethers.utils.isAddress(x.address) ? 'ethereum' : undefined }))
  },
  set: ({ set, reset }, newValue) => {
    if (newValue instanceof DefaultValue) {
      reset(_readOnlyAccountsState)
    } else {
      set(_readOnlyAccountsState, newValue)
    }
  },
})

export const accountsState = selector({
  key: 'Accounts',
  get: ({ get }) => [...get(injectedAccountsState), ...get(readOnlyAccountsState)],
})

export const substrateAccountsState = selector({
  key: 'SubstrateAccounts',
  get: ({ get }) => {
    const accounts = get(accountsState)
    return accounts.filter(x => x.type !== 'ethereum')
  },
})

export const selectedAccountAddressesState = atom<string[] | undefined>({
  key: 'SelectedAccountAddresses',
  default: undefined,
})

export const selectedAccountsState = selector({
  key: 'SelectedAccounts',
  get: ({ get }) => {
    const [accounts, injectedAccounts, selectedAddresses] = get(
      waitForAll([accountsState, injectedAccountsState, selectedAccountAddressesState])
    )

    if (selectedAddresses === undefined) {
      return injectedAccounts
    }

    const selectedAccounts = accounts.filter(({ address }) => selectedAddresses.includes(address))

    // TODO: clean this up
    return selectedAccounts.length === 0 ? injectedAccounts : selectedAccounts
  },
})

// For legacy components that only support single account selection
export const legacySelectedAccountState = selector({
  key: 'LegacySelectedAccounts',
  get: ({ get }) => {
    const [accounts, selectedAddresses] = get(waitForAll([accountsState, selectedAccountAddressesState]))

    if (selectedAddresses === undefined) return undefined

    return accounts.filter(({ address }) => selectedAddresses.includes(address))[0]
  },
})

export const selectedSubstrateAccountsState = selector({
  key: 'SelectedSubstrateAccounts',
  get: ({ get }) => {
    return get(selectedAccountsState).filter(x => x.type !== 'ethereum')
  },
})
