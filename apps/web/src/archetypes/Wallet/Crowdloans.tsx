import { ChainLogo, ExtensionStatusGate, Info, Panel, PanelSection, Pendor } from '@components'
import styled from '@emotion/styled'
import {
  getTotalContributionForCrowdloan,
  groupTotalContributionsByCrowdloan,
  useCrowdloanContributions,
} from '@libs/crowdloans'
import { Moonbeam } from '@libs/crowdloans/crowdloanOverrides'
import { MoonbeamPortfolioTag } from '@libs/moonbeam-contributors'
import { calculateCrowdloanPortfolioAmounts, usePortfolio, useTaggedAmountsInPortfolio } from '@libs/portfolio'
import { useAccountAddresses, useCrowdloanById, useCrowdloans } from '@libs/talisman'
import { useTokenPrice } from '@libs/tokenprices'
import { useChain } from '@talismn/api-react-hooks'
import { encodeAnyAddress, planckToTokens } from '@talismn/util'
import { formatCommas, formatCurrency } from '@util/helpers'
import BigNumber from 'bignumber.js'
import { Suspense, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const CrowdloanItem = styled(({ id, className }: { id: string; className?: string }) => {
  const { t } = useTranslation()
  const { crowdloan } = useCrowdloanById(id)
  const parachainId = crowdloan?.parachain.paraId
  const relayChainId = useMemo(() => id.split('-')[0], [id])
  const relayChain = useChain(relayChainId)
  const chain = useChain(parachainId)

  const { nativeToken: relayNativeToken, tokenDecimals: relayTokenDecimals } = relayChain
  const { name, longName } = chain
  const { price: relayTokenPrice, loading: relayPriceLoading } = useTokenPrice(relayNativeToken)

  const accounts = useAccountAddresses()
  const { contributions } = useCrowdloanContributions({ accounts, crowdloans: id ? [id] : undefined })
  const totalContributions = getTotalContributionForCrowdloan(id, contributions)

  const relayTokenSymbol = relayNativeToken ?? 'Planck'
  const contributedTokens = useMemo(
    () => planckToTokens(totalContributions || undefined, relayTokenDecimals),
    [relayTokenDecimals, totalContributions]
  )
  const contributedUsd = new BigNumber(contributedTokens ?? 0).times(relayTokenPrice ?? 0).toString()

  const portfolioAmounts = useMemo(
    () => calculateCrowdloanPortfolioAmounts(contributions, relayTokenDecimals, relayTokenPrice),
    [contributions, relayTokenDecimals, relayTokenPrice]
  )
  useTaggedAmountsInPortfolio(portfolioAmounts)

  return (
    <div className={`${className} ${id}`}>
      <span className="left">
        <Info title={name} subtitle={longName || name} graphic={<ChainLogo chain={chain} type="logo" size={4} />} />
        <Suspense fallback={null}>
          {Moonbeam.is(Number(id.split('-')[0]), Number(id.split('-')[1])) ? <MoonbeamPortfolioTag /> : null}
        </Suspense>
      </span>
      <span className="right">
        <Info
          title={
            <Pendor suffix={` ${relayTokenSymbol} ${t('Contributed')}`}>
              {contributedTokens && formatCommas(contributedTokens)}
            </Pendor>
          }
          subtitle={
            contributedTokens ? (
              <Pendor prefix={!contributedUsd && '-'} require={!relayPriceLoading}>
                {contributedUsd && formatCurrency(contributedUsd)}
              </Pendor>
            ) : null
          }
        />
      </span>
    </div>
  )
})`
  display: flex;
  align-items: center;
  justify-content: space-between;

  > span {
    display: flex;
    align-items: center;

    &.right {
      text-align: right;
    }
  }
`

const CrowdloanItemWithLink = styled((props: any) => {
  const { id, className } = props
  return (
    <Link to={'#'} className={className}>
      <PanelSection>
        <CrowdloanItem id={id} />
      </PanelSection>
    </Link>
  )
})`
  :first-of-type .panel-section:hover {
    border-radius: 1.6rem 1.6rem 0 0;
  }

  :last-of-type .panel-section:hover {
    border-radius: 0 0 1.6rem 1.6rem;
  }

  .panel-section:hover {
    background-color: var(--color-activeBackground);
  }
`

const ExtensionUnavailable = styled((props: any) => {
  const { t } = useTranslation()
  return (
    <PanelSection comingSoon {...props}>
      <p>{t('extensionUnavailable.subtitle')}</p>
      <p>{t('extensionUnavailable.text')}</p>
    </PanelSection>
  )
})`
  text-align: center;

  > *:not(:last-child) {
    margin-bottom: 2rem;
  }
  > *:last-child {
    margin-bottom: 0;
  }

  > h2 {
    color: var(--color-text);
    font-weight: 600;
    font-size: 1.8rem;
  }
  p {
    color: #999;
    font-size: 1.6rem;
  }
`

const Crowdloans = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const accounts = useAccountAddresses()
  const { contributions, hydrated: contributionsHydrated } = useCrowdloanContributions({ accounts })
  const totalContributions = groupTotalContributionsByCrowdloan(contributions)

  const { crowdloans, hydrated } = useCrowdloans()
  const notDisolvedCrowdloanIds = useMemo(
    () => crowdloans.filter(crowdloan => crowdloan.dissolvedBlock === null).map(crowdloan => crowdloan.id),
    [crowdloans]
  )
  const totalAliveContributions = useMemo(
    () =>
      hydrated
        ? Object.fromEntries(Object.entries(totalContributions).filter(([id]) => notDisolvedCrowdloanIds.includes(id)))
        : {},
    [hydrated, totalContributions, notDisolvedCrowdloanIds]
  )

  const { totalCrowdloansUsdByAddress } = usePortfolio()
  const genericAccounts = useMemo(() => accounts?.map(account => encodeAnyAddress(account, 42)), [accounts])
  const crowdloansUsd = useMemo(
    () =>
      Object.entries(totalCrowdloansUsdByAddress || {})
        .filter(([address]) => genericAccounts && genericAccounts.includes(address))
        .map(([, crowdloansUsd]) => crowdloansUsd)
        .reduce((prev, curr) => prev.plus(curr), new BigNumber(0))
        .toString(),
    [totalCrowdloansUsdByAddress, genericAccounts]
  )

  return (
    <section className={`wallet-crowdloans ${className}`}>
      <Panel title={t('Crowdloans')} subtitle={crowdloansUsd && formatCurrency(crowdloansUsd)}>
        {!contributionsHydrated ? (
          <PanelSection comingSoon>
            <div>{t('Summoning Crowdloan Contributions...')}</div>
            <Pendor />
          </PanelSection>
        ) : Object.keys(totalAliveContributions).length < 1 ? (
          <PanelSection comingSoon>{`${`😕 `} ${t('You have not contributed to any Crowdloans')}`}</PanelSection>
        ) : (
          <ExtensionStatusGate unavailable={<ExtensionUnavailable />}>
            {Object.keys(totalAliveContributions).map(id => (
              <CrowdloanItemWithLink key={id} id={id} />
            ))}
          </ExtensionStatusGate>
        )}
      </Panel>
    </section>
  )
}

export default Crowdloans
