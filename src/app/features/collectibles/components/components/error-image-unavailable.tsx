import { Box, Flex } from '@stacks/ui';
import { Text } from '@stacks/ui';

import { figmaTheme } from '@app/common/utils/figma-theme';
import { EyeSlashIcon } from '@app/components/icons/eye-slash-icon';

export function ErrorImageUnavailable() {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      height="100%"
      width="100%"
      backgroundColor={figmaTheme.surfacePressed}
    >
      <Box pb="12px">
        <EyeSlashIcon />
      </Box>
      <Text fontSize="12px">Image currently unavailable</Text>
    </Flex>
  );
}
