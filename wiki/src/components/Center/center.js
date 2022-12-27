import React from 'react';

function Center(props){
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
           {props.children}
        </div>
    )
}

export default Center;