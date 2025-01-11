/** @jest-environment jsdom */
import React, {useState} from 'react';
import {render} from '@testing-library/react';
import ServerCard from '../../src/components/ServerCard';
import {noop} from '../../src/utils';
import {useWindowDimensions} from '../../src/hooks';

jest.mock('../../src/hooks/useWindowDimensions');
jest.mock('../../src/components/Signal', () => (props) => (
  // @ts-expect-error
  <signal {...props} server={JSON.stringify(props.server)} />
));

describe('ServerCard', () => {
  it('should render data state', () => {
    (useWindowDimensions as jest.Mock).mockReturnValue({
      width: 1000,
      height: 800,
    });
    const serverStatus = {
      online: true,
      loading: false,
      pingAvgMs: 60,
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
      style: {width: 200, height: 200},
      onFocus: jest.fn(),
      onBlur: jest.fn(),
      tabIndex: 0,
      index: 0,
    };

    // @ts-ignore - This is a bad players.list type definition. Should be string[].
    const {container, getByTestId} = render(<ServerCard {...props} />);

    const card = getByTestId('server-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('style', 'width: 200px; height: 200px;');
    expect(card).toHaveAttribute('tabindex', props.tabIndex.toString());
    // Icon
    const serverIcon = getByTestId('server-icon');
    expect(serverIcon).toBeInTheDocument();
    expect(serverIcon).toHaveAttribute('src', serverStatus.icon);
    expect(serverIcon).toHaveAttribute('alt');
    // Title
    const serverTitle = getByTestId('server-card-title');
    expect(serverTitle).toBeInTheDocument();
    expect(serverTitle).toHaveTextContent(props.name);
    expect(serverTitle).toHaveAttribute('title', props.address);
    // Player Count
    const serverPlayerCount = getByTestId('server-player-count');
    expect(serverPlayerCount).toBeInTheDocument();
    expect(serverPlayerCount).toHaveTextContent(
      `${serverStatus.players.online}/${serverStatus.players.max}`,
    );
    expect(serverPlayerCount).toHaveAttribute(
      'title',
      serverStatus.players.list.join('\n'),
    );
    // Signal Strength
    const signalStrength = getByTestId('server-signal-strength');
    expect(signalStrength).toBeInTheDocument();
    expect(signalStrength).toHaveAttribute(
      'server',
      JSON.stringify({
        hostname: props.address,
        online: serverStatus.online,
        loading: serverStatus.loading,
        pingAvgMs: serverStatus.pingAvgMs,
      }),
    );
    // Body
    const serverDetails = getByTestId('server-card-body');
    expect(serverDetails).toBeInTheDocument();
    expect(serverDetails).toContainElement(getByTestId('motd-html'));

    expect(container).toMatchSnapshot();
  });

  it('should render error/offline state', () => {
    const {container, getByTestId} = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{online: false}}
        onFocus={noop}
        onBlur={noop}
        tabIndex={0}
        index={0}
      />,
    );
    const serverDetails = getByTestId('server-card-body');
    expect(serverDetails).toBeInTheDocument();
    expect(serverDetails).toHaveTextContent("Can't connect to server");

    expect(container).toMatchSnapshot();
  });

  it('should render loading state', () => {
    const {container, queryByTestId, getByTestId} = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{loading: true}}
        onFocus={noop}
        onBlur={noop}
        tabIndex={0}
        index={0}
      />,
    );
    expect(queryByTestId('server-player-count')).toBeNull();
    const serverDetails = getByTestId('server-card-body');
    expect(serverDetails).toBeInTheDocument();
    expect(serverDetails).toHaveTextContent('');

    expect(container).toMatchSnapshot();
  });

  it('should call onFocus when focused', () => {
    const onFocus = jest.fn();
    const setIsSelected = jest.fn();
    (useState as jest.Mock).mockReturnValue([false, setIsSelected]);
    const serverCard = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{}}
        onFocus={onFocus}
        onBlur={noop}
        tabIndex={0}
        index={0}
      />,
    );
    const card = serverCard.getByTestId('server-card');
    card.focus();
    expect(onFocus).toHaveBeenCalledWith(0);
    expect(setIsSelected).toHaveBeenCalledWith(true);
  });

  it('should call onBlur when blurred', () => {
    const onBlur = jest.fn();
    const setIsSelected = jest.fn();
    (useState as jest.Mock).mockReturnValue([true, setIsSelected]);
    (useWindowDimensions as jest.Mock).mockReturnValueOnce({
      width: 450,
      height: 800,
    });
    const serverCardElement = () => (
      <ServerCard
        name='Test Server'
        address='test.server.com'
        // @ts-expect-error
        status={{online: true, motd: {}}}
        onFocus={noop}
        onBlur={onBlur}
        tabIndex={0}
        index={0}
      />
    );
    const serverCard = render(serverCardElement());
    const card = serverCard.getByTestId('server-card');
    card.focus();
    card.blur();
    expect(onBlur).toHaveBeenCalled();
    expect(setIsSelected).toHaveBeenCalledWith(false);
    (useState as jest.Mock).mockReturnValue([false, setIsSelected]);
    serverCard.rerender(serverCardElement());
    expect(card).not.toHaveClass('card-selected');
  });

  it('should call onClick with index when clicked', () => {
    const onClick = jest.fn();
    const setIsSelected = jest.fn();
    (useState as jest.Mock).mockReturnValue([false, setIsSelected]);
    const serverCardElement = () => (
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={{}}
        onFocus={noop}
        onBlur={noop}
        onClick={onClick}
        tabIndex={0}
        index={0}
      />
    );
    const {getByTestId, rerender} = render(serverCardElement());
    const card = getByTestId('server-card');
    expect(card).not.toHaveClass('card-selected');
    card.click();
    expect(onClick).toHaveBeenCalledWith(0);
    expect(setIsSelected).toHaveBeenCalledWith(true);
    (useState as jest.Mock).mockReturnValue([true, setIsSelected]);
    rerender(serverCardElement());
    expect(card).toHaveClass('card-selected');
  });

  it('should show "no players online" when no players are online', () => {
    const serverStatus = {
      online: true,
      motd: {html: ['A Server'], raw: [], clean: []},
      players: {
        online: 0,
        max: 10,
      },
    };
    const {container, getByTestId} = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={serverStatus}
        onFocus={noop}
        onBlur={noop}
        tabIndex={0}
        index={0}
      />,
    );
    const serverPlayerCount = getByTestId('server-player-count');
    expect(serverPlayerCount).toBeInTheDocument();
    expect(serverPlayerCount).toHaveTextContent(
      `${serverStatus.players.online}/${serverStatus.players.max}`,
    );
    expect(serverPlayerCount).toHaveAttribute('title', 'No players online');
    expect(container).toMatchSnapshot();
  });

  it('should show "No players disclosed" when players are online but not disclosed', () => {
    (useWindowDimensions as jest.Mock).mockReturnValueOnce({
      width: 450,
      height: 800,
    });
    const serverStatus = {
      online: true,
      motd: {html: ['A Server'], raw: [], clean: []},
      players: {
        online: 5,
        max: 10,
      },
    };
    const {container, getByTestId} = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        status={serverStatus}
        onFocus={noop}
        onBlur={noop}
        tabIndex={0}
        index={0}
      />,
    );
    const serverPlayerCount = getByTestId('server-player-count');
    expect(serverPlayerCount).toBeInTheDocument();
    expect(serverPlayerCount).toHaveTextContent(
      `${serverStatus.players.online}/${serverStatus.players.max}`,
    );
    expect(serverPlayerCount).toHaveAttribute('title', 'No players disclosed');
    expect(container).toMatchSnapshot();
  });

  it('should show player list for mobile view when selected', () => {
    (useState as jest.Mock).mockReturnValue([true, noop]);
    (useWindowDimensions as jest.Mock).mockReturnValueOnce({
      width: 450,
      height: 800,
    });
    const serverStatus = {
      online: true,
      motd: {raw: [], clean: [], html: ['Worlds Without End']},
      version: '1.16.5, 1.17.1',
      players: {
        online: 1,
        max: 10,
        list: ['test-player-1', 'test-player-2', 'test-player-3'],
      },
    };
    const {container, getByTestId} = render(
      <ServerCard
        name='Test Server'
        address='test.server.com'
        // @ts-ignore - This is a bad players.list type definition. Should be string[].
        status={serverStatus}
        onFocus={noop}
        onBlur={noop}
        tabIndex={0}
        index={0}
        isSelected={true}
      />,
    );
    const mobileCardVersions = getByTestId('mobile-server-card-versions');
    expect(mobileCardVersions).toBeInTheDocument();
    expect(mobileCardVersions).toHaveTextContent('1.16.51.17.1');
    const mobileCardPlayers = getByTestId('mobile-server-card-player-list');
    expect(mobileCardPlayers).toBeInTheDocument();
    expect(mobileCardPlayers).toHaveTextContent(
      serverStatus.players.list.join(', '),
    );

    expect(container).toMatchSnapshot();
  });
});
