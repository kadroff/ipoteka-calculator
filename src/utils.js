import React from "react";

export const PaymentTitle = props => {
  let paymentTitle = "";
  if (props.credit === true) {
    paymentTitle += "Размер кредита";
  } else if (props.immovables === true) {
    paymentTitle += "Стоимость недвижимости";
  } else paymentTitle += "Размер дохода";
  return <p>{paymentTitle}</p>;
};
