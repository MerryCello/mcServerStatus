import React, {
  FocusEventHandler,
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useState,
} from 'react';
import parse from 'html-react-parser';
import Signal from '../Signal';
import serverDefaultIcon from '../../images/serverDefaultIcon.png';
import {useWindowDimensions} from '../../hooks';
import {ARROWS, ARROWS_SELECTED, getAttribute} from './utils';
import {ServerCardProps, OnMouseEnter, OnMouseLeave} from './types';

const ServerCardFC: ForwardRefRenderFunction<any, ServerCardProps> = (
  {
    name,
    address,
    status,
    style,
    onFocus,
    onBlur,
    onClick,
    showUpArrow,
    showDownArrow,
    onUpClick,
    onDownClick,
    tabIndex,
    index,
    isSelected: isSelectedProp,
    isDraggable,
  },
  ref,
) => {
  const {icon, motd, players} = status ?? {};
  const playersOnline = players?.online;
  const maxPlayers = players?.max;

  const {width} = useWindowDimensions();
  const isMobileOrTablet = width < 500;
  const [isSelected, setIsSelected] = useState(isSelectedProp);
  const [shouldShowArrows, setShouldShowArrows] = useState(false);

  useEffect(() => {
    setIsSelected(isSelectedProp);
  }, [isSelectedProp]);

  const showArrows = () =>
    setShouldShowArrows(
      !isMobileOrTablet && (!!showUpArrow || !!showDownArrow),
    );
  const hideArrows = () => setShouldShowArrows(false);

  const onArrowMouseEnter: OnMouseEnter = (e) => {
    e.currentTarget.src = ARROWS_SELECTED[getAttribute(e, 'data-testid')];
  };
  const onArrowMouseLeave: OnMouseLeave = (e) => {
    e.currentTarget.src = ARROWS[getAttribute(e, 'data-testid')];
  };

  const onUpButtonClick = () => onUpClick?.(index);
  const onDownButtonClick = () => onDownClick?.(index);

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
      ref={ref}
      data-testid='server-card'
      className={'card-grid' + (isSelected ? ' card-selected' : '')}
      style={style}
      onBlur={cardOnBlur}
      onClick={cardOnClick}
      onFocus={cardOnFocus}
      onMouseEnter={showArrows}
      onMouseLeave={hideArrows}
      tabIndex={tabIndex}>
      <div className='card-icon'>
        {(shouldShowArrows || (isMobileOrTablet && isDraggable)) && (
          <div data-test-id='arrows' className='server-card-arrows-container'>
            <div>
              <img
                data-testid='up-button'
                src={ARROWS['up-button']}
                className={showUpArrow ? '' : 'hidden-arrow'}
                onMouseEnter={onArrowMouseEnter}
                onMouseLeave={onArrowMouseLeave}
                onClick={showUpArrow ? onUpButtonClick : undefined}
                alt='button to move the server card up'
              />
              <img
                data-testid='down-button'
                src={ARROWS['down-button']}
                className={showDownArrow ? '' : 'hidden-arrow'}
                onMouseEnter={onArrowMouseEnter}
                onMouseLeave={onArrowMouseLeave}
                onClick={showDownArrow ? onDownButtonClick : undefined}
                alt='button to move the server card down'
              />
            </div>
            {!isMobileOrTablet && (
              <img
                data-testid='play-button'
                className='hidden-arrow'
                src={ARROWS['play-button']}
                onMouseEnter={onArrowMouseEnter}
                onMouseLeave={onArrowMouseLeave}
                alt=''
              />
            )}
          </div>
        )}
        <img
          data-testid='server-icon'
          src={icon ? icon : serverDefaultIcon}
          alt='icon for server'
        />
      </div>
      <div data-testid='server-details' className='server-details'>
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

export const ServerCard = forwardRef<any, ServerCardProps>(ServerCardFC);
