'use client';

import React from 'react';

const OrderPage = ({ params }: { params: { tableId: string } }) => {
  return (
    <div>
      <h1>Table: {params.tableId}</h1>
      <p>This is a minimal page to test the build.</p>
    </div>
  );
};

export default OrderPage; 