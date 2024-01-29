import React, {FC} from 'react';
import {useLocation} from 'react-router-dom';
import Button from '../components/Button';
import {deleteUserServer} from '../firebase/controlers';
import {useButtonNavigate} from '../hooks';

const DeleteServerPage: FC = () => {
  const {state: routeParam} = useLocation();
  const navigate = useButtonNavigate();

  const navigateHome = () => navigate('/mcServerStatus');

  const deleteOnClick = () => {
    deleteUserServer(routeParam?.id).then(navigateHome);
  };

  return (
    <div className='main-container delete-page-container column'>
      <p>Are you sure you want to remove this server?</p>
      <p>{`\`${
        routeParam?.name ?? ''
      }' will be lost forever! (A long time!)`}</p>
      <div className='buttons row'>
        <Button onClick={deleteOnClick} style={{flex: 1, marginRight: '35px'}}>
          Delete
        </Button>
        <Button onClick={navigateHome} style={{flex: 1}}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DeleteServerPage;
