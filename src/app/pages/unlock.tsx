import { Outlet, useNavigate } from 'react-router-dom';

import { Stack } from '@stacks/ui';

import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { CenteredPageContainer } from '@app/components/centered-page-container';
import { CENTERED_FULL_PAGE_MAX_WIDTH } from '@app/components/global-styles/full-page-styles';
import { Header } from '@app/components/header';
import { RequestPassword } from '@app/components/request-password';

export function Unlock() {
  const navigate = useNavigate();

  useRouteHeader(<Header />);

  // Users land on unlock page as they've been directed here from `<AccountGate/>`.
  // On successful unlock, we can navigate back to the previous page, now
  // with account details.
  const handleSuccess = () => navigate(-1);

  return (
    <CenteredPageContainer>
      <Stack
        maxWidth={CENTERED_FULL_PAGE_MAX_WIDTH}
        px={['loose', 'base-loose']}
        spacing="loose"
        textAlign={['left', 'center']}
        width="100%"
      >
        <RequestPassword
          title="Your session is locked"
          caption="Enter the password you set on this device"
          onSuccess={handleSuccess}
        />
      </Stack>
      <Outlet />
    </CenteredPageContainer>
  );
}
