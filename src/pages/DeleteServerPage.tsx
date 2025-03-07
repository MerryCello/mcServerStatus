import React, {FC} from 'react';
import {useLocation} from 'react-router-dom';
import Button from '../components/Button';
import {deleteUserServer} from '../firebase/controlers';
import {useButtonNavigate} from '../hooks';

export type DeleteRouteLocation = {
  state: {
    listId?: string;
    id?: string;
    name?: string;
  };
};

const DeleteServerPage: FC = () => {
  const {state: routeParams}: DeleteRouteLocation = useLocation();
  const navigate = useButtonNavigate();

  const goBack = () => navigate(-1);

  const deleteOnClick = () => {
    deleteUserServer(routeParams?.id, routeParams?.listId).then(goBack);
  };

  return (
    <div className='main-container delete-page-container column'>
      <p>Are you sure you want to remove this server?</p>
      <p>{`\`${
        routeParams?.name ?? ''
      }' will be lost forever! (A long time!)`}</p>
      <div className='buttons row'>
        <Button onClick={deleteOnClick} style={{flex: 1, marginRight: '35px'}}>
          Delete
        </Button>
        <Button onClick={goBack} style={{flex: 1}}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DeleteServerPage;
