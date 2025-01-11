/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import ServerCard from '../../src/components/ServerCard';

// jest.mock('../../src/hooks/useWindowDimensions', () => ({
//   useWindowDimensions: () => ({ width: 450, height: 800 }),
// }));
jest.mock('../../src/components/Signal', () => 'signal');

describe('ServerCard', () => {
  it('renders ServerCard', () => {
    const serverStatus = {
      icon: 'test-icon',
      motd: {
        raw: ['§l§9Worlds Without End§r§r'],
        clean: ['Worlds Without End'],
        html: [
          '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
        ],
      },
      players: {
        online: 1,
        max: 10,
        list: ['test-player-1', 'test-player-2', 'test-player-3'],
      },
    };
    const props = {
      name: 'Test Server',
      address: 'test.server.com',
      status: serverStatus,
      style: { width: 200, height: 200 },
      onFocus: jest.fn(),
      onBlur: jest.fn(),
      tabIndex: 0,
      index: 0,
    };

    // @ts-ignore
    const serverCard = render(<ServerCard {...props} />);

    expect(serverCard.getByTestId('server-card')).toBeInTheDocument();
    // Icon
    const serverIcon = serverCard.getByTestId('server-icon');
    expect(serverIcon).toBeInTheDocument();
    expect(serverIcon).toHaveAttribute('src', serverStatus.icon);
    expect(serverIcon).toHaveAttribute('alt');
    // Title
    const serverTitle = serverCard.getByTestId('server-card-title');
    expect(serverTitle).toBeInTheDocument();
    expect(serverTitle).toHaveTextContent(props.name);
    expect(serverTitle).toHaveAttribute('title', props.address);
    // Details
    const serverDetails = serverCard.getByTestId('server-details');
    expect(serverDetails).toBeInTheDocument();
    // Player Count
    const serverPlayerCount = serverCard.getByText('server-player-count');
    expect(serverPlayerCount).toBeInTheDocument();
    expect(serverPlayerCount).toHaveTextContent(
      `${serverStatus.players.online}/${serverStatus.players.max}`,
    );
    expect(serverPlayerCount).toHaveAttribute(
      'title',
      serverStatus.players.list.join('\n'),
    );
    // Signal Strength
    const signalStrength = serverCard.getByTestId('server-signal-strength');
    expect(signalStrength).toBeInTheDocument();
    expect(signalStrength).toHaveAttribute('server');

    expect(serverCard.container).toMatchSnapshot();
  });

  xit('should call onFocus when focused', () => {
    const onFocus = jest.fn();
    const serverCard = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{
          icon: 'test-icon',
          motd: {
            raw: ['§l§9Worlds Without End§r§r'],
            clean: ['Worlds Without End'],
            html: [
              '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
            ],
          },
          players: {
            online: 1,
            max: 10,
          },
        }}
        style={{ width: 200, height: 200 }}
        onFocus={onFocus}
        onBlur={jest.fn()}
        tabIndex={0}
        index={0}
      />,
    );
    const card = serverCard.getByTestId('ServerCard');
    card.focus();
    expect(onFocus).toHaveBeenCalled();
  });

  xit('should call onBlur when blurred', () => {
    const onBlur = jest.fn();
    const serverCard = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{
          icon: 'test-icon',
          motd: {
            raw: ['§l§9Worlds Without End§r§r'],
            clean: ['Worlds Without End'],
            html: [
              '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
            ],
          },
          players: {
            online: 1,
            max: 10,
          },
        }}
        style={{ width: 200, height: 200 }}
        onFocus={jest.fn()}
        onBlur={onBlur}
        tabIndex={0}
        index={0}
      />,
    );
    const card = serverCard.getByTestId('ServerCard');
    card.focus();
    card.blur();
    expect(onBlur).toHaveBeenCalled();
  });

  xit('should call onClick with index when clicked', () => {
    const onClick = jest.fn();
    const serverCard = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{
          icon: 'test-icon',
          motd: {
            raw: ['§l§9Worlds Without End§r§r'],
            clean: ['Worlds Without End'],
            html: [
              '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
            ],
          },
          players: {
            online: 1,
            max: 10,
          },
        }}
        style={{ width: 200, height: 200 }}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
        onClick={onClick}
        tabIndex={0}
        index={0}
      />,
    );
    const card = serverCard.getByTestId('ServerCard');
    card.click();
    expect(onClick).toHaveBeenCalledWith(0);
  });

  xit('should set isSelected to true when clicked', () => {
    const serverCard = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{
          icon: 'test-icon',
          motd: {
            raw: ['§l§9Worlds Without End§r§r'],
            clean: ['Worlds Without End'],
            html: [
              '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
            ],
          },
          players: {
            online: 1,
            max: 10,
          },
        }}
        style={{ width: 200, height: 200 }}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
        tabIndex={0}
        index={0}
      />,
    );
    const card = serverCard.getByTestId('ServerCard');
    card.click();
    expect(card).toHaveClass('card-selected');
  });

  xit('should set isSelected to false when blurred', () => {
    const serverCard = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{
          icon: 'test-icon',
          motd: {
            raw: ['§l§9Worlds Without End§r§r'],
            clean: ['Worlds Without End'],
            html: [
              '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
            ],
          },
          players: {
            online: 1,
            max: 10,
          },
        }}
        style={{ width: 200, height: 200 }}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
        tabIndex={0}
        index={0}
      />,
    );
    const card = serverCard.getByTestId('ServerCard');
    card.click();
    card.blur();
    expect(card).not.toHaveClass('card-selected');
  });

  xit('should show "no players online" when no players are online', () => {
    const serverCard = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{
          icon: 'test-icon',
          motd: {
            raw: ['§l§9Worlds Without End§r§r'],
            clean: ['Worlds Without End'],
            html: [
              '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
            ],
          },
          players: {
            online: 0,
            max: 10,
          },
        }}
        style={{ width: 200, height: 200 }}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
        tabIndex={0}
        index={0}
      />,
    );
    const players = serverCard.getByText('0/10 players online');
    expect(players).toBeInTheDocument();
  });

  xit('should show "No players disclosed" when players are online but not disclosed', () => {
    const serverCard = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{
          icon: 'test-icon',
          motd: {
            raw: ['§l§9Worlds Without End§r§r'],
            clean: ['Worlds Without End'],
            html: [
              '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
            ],
          },
          players: {
            online: 1,
            max: 10,
          },
        }}
        style={{ width: 200, height: 200 }}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
        tabIndex={0}
        index={0}
      />,
    );
    const players = serverCard.getByText('No players disclosed');
    expect(players).toBeInTheDocument();
  });

  xit('should show "Can\'t connect to server" when server is not online', () => {
    const serverCard = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{
          icon: 'test-icon',
          motd: {
            raw: ['§l§9Worlds Without End§r§r'],
            clean: ['Worlds Without End'],
            html: [
              '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
            ],
          },
          players: {
            online: 1,
            max: 10,
          },
          online: false,
        }}
        style={{ width: 200, height: 200 }}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
        tabIndex={0}
        index={0}
      />,
    );
    const players = serverCard.getByText("Can't connect to server");
    expect(players).toBeInTheDocument();
  });

  xit('should show motd when server is online', () => {
    const serverCard = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{
          icon: 'test-icon',
          motd: {
            raw: ['§l§9Worlds Without End§r§r'],
            clean: ['Worlds Without End'],
            html: [
              '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
            ],
          },
          players: {
            online: 1,
            max: 10,
          },
          online: true,
        }}
        style={{ width: 200, height: 200 }}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
        tabIndex={0}
        index={0}
      />,
    );
    const motd = serverCard.getByText('Worlds Without End');
    expect(motd).toBeInTheDocument();
  });

  xit('should show player list for mobile view', () => {
    const serverCard = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{
          icon: 'test-icon',
          motd: {
            raw: ['§l§9Worlds Without End§r§r'],
            clean: ['Worlds Without End'],
            html: [
              '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
            ],
          },
          players: {
            online: 1,
            max: 10,
            list: [{ name: 'test-player', uuid: 'test-uuid' }],
          },
          online: true,
        }}
        style={{ width: 200, height: 200 }}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
        tabIndex={0}
        index={0}
        // @ts-ignore TODO: mock screen width to 450px
        isMobileOrTablet={true}
        isSelected={true}
      />,
    );
    const player = serverCard.getByText('test-player');
    expect(player).toBeInTheDocument();
  });
});
