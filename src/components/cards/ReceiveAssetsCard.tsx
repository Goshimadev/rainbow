import { AccentColorProvider, Inline, Stack, Text } from '@/design-system';
import React, { useCallback } from 'react';
import { GenericCard } from './GenericCard';
import { useAccountProfile, useClipboard } from '@/hooks';
import { ButtonPressAnimation } from '../animations';
import { FloatingEmojis } from '@/components/floating-emojis';
import { useRecoilState } from 'recoil';
import { addressCopiedToastAtom } from '@/screens/WalletScreen';
import { haptics } from '@/utils';
import { useNavigation } from '@/navigation';
import Routes from '@/navigation/routesNames';
import { analytics } from '@/analytics';
import { IconOrb } from './reusables/IconOrb';
import { useAccountAccentColor } from '@/hooks/useAccountAccentColor';
import { TintButton } from './reusables/TintButton';

export const ReceiveCardHeight = 174;

export const ReceiveAssetsCard = () => {
  const { accountAddress } = useAccountProfile();
  const { navigate } = useNavigation();
  const { setClipboard } = useClipboard();
  const [isToastActive, setToastActive] = useRecoilState(
    addressCopiedToastAtom
  );

  const onPressCopy = useCallback(
    onNewEmoji => {
      if (!isToastActive) {
        setToastActive(true);
        setTimeout(() => {
          setToastActive(false);
        }, 2000);
      }
      haptics.notificationSuccess();
      onNewEmoji();
      setClipboard(accountAddress);
    },
    [accountAddress, isToastActive, setClipboard, setToastActive]
  );

  const onPressQRCode = useCallback(() => {
    analytics.track('Tapped "My QR Code"', {
      category: 'ReceiveAssetsCard',
    });
    navigate(Routes.RECEIVE_MODAL);
  }, [navigate]);

  const { accentColor } = useAccountAccentColor();

  return (
    <GenericCard type="stretch">
      <Stack space="36px">
        <Inline alignHorizontal="justify">
          <Stack space="16px">
            <Text size="22pt" weight="heavy" color="label">
              Receive Assets
            </Text>
            <Text size="15pt" weight="semibold" color="labelSecondary">
              {'You can also long press your\naddress above to copy it.'}
            </Text>
          </Stack>
          <ButtonPressAnimation onPress={onPressQRCode} scaleTo={0.8}>
            <IconOrb color={accentColor} icon="􀖂" shadowColor="accent" />
          </ButtonPressAnimation>
        </Inline>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
        /* @ts-ignore - JS component */}
        <FloatingEmojis
          distance={250}
          duration={500}
          fadeOut={false}
          scaleTo={0}
          size={50}
          wiggleFactor={0}
        >
          {({ onNewEmoji }: { onNewEmoji: () => void }) => (
            <AccentColorProvider color={accentColor}>
              <TintButton onPress={() => onPressCopy(onNewEmoji)} height={36}>
                􀐅 Copy Address
              </TintButton>
            </AccentColorProvider>
          )}
        </FloatingEmojis>
      </Stack>
    </GenericCard>
  );
};
