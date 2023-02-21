import lang from 'i18n-js';
import React, { useCallback, useState } from 'react';
import { TokenInfoItem } from '../../token-info';
import { Columns } from '@/design-system';
import { Network } from '@/helpers';
import { useAccountSettings } from '@/hooks';
import { useNavigation } from '@/navigation';
import Routes from '@/navigation/routesNames';
import { useTheme } from '@/theme';
import { convertAmountToNativeDisplay } from '@/helpers/utilities';
import { ethereumUtils } from '@/utils';
import { UniqueAsset } from '@/entities';
import {
  SimplehashFloorPrice,
  SimplehashLastSale,
} from '@/entities/uniqueAssets';
import { fetchSimplehashNftCollectionListings } from '@/handlers/simplehash';

const NONE = 'None';
const OPENSEA_MARKETPLACE_ID = 'opensea';
const ETH_PAYMENT_TOKEN_ID = 'ethereum.native';

const getIsFloorPriceSupported = (network: Network) => {
  switch (network) {
    case Network.mainnet:
      return true;
    default:
      return false;
  }
};

const getRoundedValueFromRawAmount = (
  rawAmount: number | null | undefined,
  decimals: number | null | undefined
) => {
  if (rawAmount && decimals) {
    return Math.round(rawAmount * 10 ** -decimals * 1000) / 1000;
  }
  return null;
};

const getLastSaleString = (lastSale: SimplehashLastSale | null) => {
  const value = getRoundedValueFromRawAmount(
    lastSale?.unit_price,
    lastSale?.payment_token?.decimals
  );
  if (value !== null) {
    const tokenSymbol = lastSale?.payment_token?.symbol;
    if (value === 0) {
      return `< 0.001 ${tokenSymbol}`;
    } else {
      return `${value} ${tokenSymbol}`;
    }
  }
  return NONE;
};

const getOpenSeaFloorPrice = (asset: UniqueAsset) => {
  if (getIsFloorPriceSupported(asset?.network)) {
    const floorPrices = asset?.collection?.floor_prices;
    const openSeaFloorPrice = floorPrices?.find(
      (floorPrice: SimplehashFloorPrice) =>
        floorPrice.marketplace_id === OPENSEA_MARKETPLACE_ID
    );
    if (
      openSeaFloorPrice?.payment_token.payment_token_id === ETH_PAYMENT_TOKEN_ID
    ) {
      const roundedValue = getRoundedValueFromRawAmount(
        openSeaFloorPrice.value,
        openSeaFloorPrice?.payment_token.decimals
      );
      if (roundedValue) {
        return `${roundedValue} ETH`;
      }
    }
  }
  return NONE;
};

export default function NFTBriefTokenInfoRow({
  asset,
}: {
  asset: UniqueAsset;
}) {
  // TODO
  const currentPrice = null;

  fetchSimplehashNftCollectionListings(asset?.collection?.collection_id);

  const { colors } = useTheme();

  const { navigate } = useNavigation();

  const { nativeCurrency } = useAccountSettings();

  const floorPrice = getOpenSeaFloorPrice(asset);

  const [showCurrentPriceInEth, setShowCurrentPriceInEth] = useState(true);
  const toggleCurrentPriceDisplayCurrency = useCallback(
    () => setShowCurrentPriceInEth(!showCurrentPriceInEth),
    [showCurrentPriceInEth, setShowCurrentPriceInEth]
  );

  const [showFloorInEth, setShowFloorInEth] = useState(true);
  const toggleFloorDisplayCurrency = useCallback(
    () => setShowFloorInEth(!showFloorInEth),
    [showFloorInEth, setShowFloorInEth]
  );

  const handlePressCollectionFloor = useCallback(() => {
    navigate(Routes.EXPLAIN_SHEET, {
      type: 'floor_price',
    });
  }, [navigate]);

  const lastSalePrice = getLastSaleString(asset?.lastSale);
  const priceOfEth = ethereumUtils.getEthPriceUnit() as number;

  return (
    <Columns space="19px (Deprecated)">
      {/* @ts-expect-error JavaScript component */}
      <TokenInfoItem
        color={
          lastSalePrice === NONE && !currentPrice
            ? colors.alpha(colors.whiteLabel, 0.5)
            : colors.whiteLabel
        }
        enableHapticFeedback={!!currentPrice}
        isNft
        onPress={toggleCurrentPriceDisplayCurrency}
        size="big"
        title={
          currentPrice
            ? `􀋢 ${lang.t('expanded_state.nft_brief_token_info.for_sale')}`
            : lang.t('expanded_state.nft_brief_token_info.last_sale')
        }
        weight={lastSalePrice === NONE && !currentPrice ? 'bold' : 'heavy'}
      >
        {showCurrentPriceInEth || nativeCurrency === 'ETH' || !currentPrice
          ? currentPrice || lastSalePrice
          : convertAmountToNativeDisplay(
              // @ts-expect-error currentPrice is a number?
              parseFloat(currentPrice) * priceOfEth,
              nativeCurrency
            )}
      </TokenInfoItem>
      {/* @ts-expect-error JavaScript component */}
      <TokenInfoItem
        align="right"
        color={
          floorPrice === NONE
            ? colors.alpha(colors.whiteLabel, 0.5)
            : colors.whiteLabel
        }
        enableHapticFeedback={floorPrice !== NONE}
        isNft
        loading={!floorPrice}
        onInfoPress={handlePressCollectionFloor}
        onPress={toggleFloorDisplayCurrency}
        showInfoButton
        size="big"
        title="Floor price"
        weight={floorPrice === NONE ? 'bold' : 'heavy'}
      >
        {showFloorInEth ||
        nativeCurrency === 'ETH' ||
        floorPrice === NONE ||
        floorPrice === null
          ? floorPrice
          : convertAmountToNativeDisplay(
              parseFloat(floorPrice) * priceOfEth,
              nativeCurrency
            )}
      </TokenInfoItem>
    </Columns>
  );
}
