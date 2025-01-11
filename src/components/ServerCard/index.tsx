import React, {CSSProperties, FC, FocusEventHandler, useState} from 'react';
import parse from 'html-react-parser';
import Signal from '../Signal';
import serverDefaultIcon from '../../images/serverDefaultIcon.png';
import {useWindowDimensions} from '../../hooks';
import {ServerStatus} from '../../types';

type ServerCardProps = {
  name: string;
  address: string;
  status: ServerStatus;
  style?: CSSProperties;
  onFocus: (index: number) => void;
  onBlur: FocusEventHandler<HTMLDivElement>;
  onClick?: (index: number) => void;
  tabIndex: number;
  index: number;
};

const ServerCard: FC<ServerCardProps> = ({
  name,
  address,
  status,
  style,
  onFocus,
  onBlur,
  onClick,
  tabIndex,
  index,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const icon = status?.icon;
  const motd = status?.motd;
  const playersOnline = status?.players?.online;
  const maxPlayers = status?.players?.max;

  const {width} = useWindowDimensions();
  const isMobileOrTablet = width < 500;

  const cardOnClick = () => {
    setIsSelected(true);
    onClick?.(index);
  };

  const cardOnFocus = () => {
    setIsSelected(true);
    onFocus?.(index);
  };

  const cardOnBlur: FocusEventHandler<HTMLDivElement> = (event) => {
    setIsSelected(false);
    onBlur?.(event);
  };

  return (
    // TODO: put inline styles in CSS file
    <div
      data-testid='server-card'
      className={'card-grid' + (isSelected ? ' card-selected' : '')}
      style={style}
      onFocus={cardOnFocus}
      onBlur={cardOnBlur}
      onClick={cardOnClick}
      tabIndex={tabIndex}>
      <div className='card-icon'>
        <img
          data-testid='server-icon'
          src={icon ? icon : serverDefaultIcon}
          alt='icon for server'
        />
      </div>
      <div className='server-details'>
        <div className='text-left'>
          <div className='card-srv-name-status'>
            <span data-testid='server-card-title' title={address}>
              {name}
            </span>
            <span className='card-srv-name-status'>
              {status?.online && (
                <span
                  data-testid='server-player-count'
                  className='pr-2 players-online'
                  style={{color: '#7e7e7e'}}
                  title={
                    status?.players?.list
                      ? status.players.list.join('\n')
                      : status?.players?.online
                      ? 'No players disclosed'
                      : 'No players online'
                  }>
                  {`${playersOnline ?? '-'}/${maxPlayers ?? '-'}`}
                </span>
              )}
              <Signal
                data-testid='server-signal-strength'
                server={{
                  hostname: address,
                  online: status?.online,
                  loading: status?.loading,
                  pingAvgMs: status?.pingAvgMs,
                }}
                size={1}
                style={{paddingBottom: 5}}
              />
            </span>
          </div>
        </div>
        <div className='text-left'>
          <p
            data-testid='server-card-body'
            className='m-0'
            style={status?.online ? {color: '#7e7e7e'} : {color: 'red'}}>
            {status?.online && motd
              ? parse(
                  motd?.html
                    ?.map(
                      (strHtml, i) =>
                        `<span data-testid="motd-html" key={${i}}>${strHtml}</span>`,
                    )
                    .join('<br/>') || '',
                )
              : status?.loading
              ? ''
              : "Can't connect to server"}
          </p>
        </div>
      </div>
      {isMobileOrTablet && isSelected && (
        <>
          <p
            data-testid='mobile-server-card-versions'
            style={{color: '#7e7e7e'}}>
            {parse(
              status?.version?.replace(/ /gm, '<br/>').replace(/,/gm, '') || '',
            )}
          </p>
          <p
            data-testid='mobile-server-card-player-list'
            className='player-list'>
            {status?.players?.list
              ? status.players.list.join(', ')
              : status?.players?.online
              ? 'No players disclosed'
              : 'No players online'}
          </p>
        </>
      )}
    </div>
  );
};

export default ServerCard;
