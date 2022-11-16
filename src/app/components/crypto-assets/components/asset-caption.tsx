import { FiInfo } from 'react-icons/fi';

import { Box, Flex, Tooltip, color } from '@stacks/ui';

import { Caption } from '@app/components/typography';

interface AssetCaptionProps {
  caption: string;
  isUnanchored?: boolean;
}
export function AssetCaption({ caption, isUnanchored }: AssetCaptionProps) {
  return (
    <Flex flexDirection="row" alignItems="center">
      <Caption>{caption}</Caption>{' '}
      {isUnanchored ? (
        <>
          <Caption ml={1}> • Microblock</Caption>
          <Tooltip placement="right-end" label={'Learn more about microblocks'}>
            <a href="https://docs.stacks.co/understand-stacks/microblocks" target="_blank">
              <Box
                _hover={{ cursor: 'pointer' }}
                size="12px"
                color={color('text-caption')}
                as={FiInfo}
                ml={1}
              />
            </a>
          </Tooltip>
        </>
      ) : null}
    </Flex>
  );
}
