const axios = require("axios").default;

const publishPackage = async ({ accessToken, productID }) => {
  const data = JSON.stringify({
    notes: "This is a Test deployemnt",
  });

  const config = {
    method: "post",
    url: `https://api.addons.microsoftedge.microsoft.com/v1/products/${productID}/submissions`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios(config);

  return response?.headers?.location;
};

const checkPublishPackageStatus = async ({
  accessToken,
  productID,
  operationID,
}) => {
  const config = {
    method: "get",
    url: `https://api.addons.microsoftedge.microsoft.com/v1/products/${productID}/submissions/operations/${operationID}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const response = await axios(config);

  return response.data;
};

module.exports = {
  publishPackage,
  checkPublishPackageStatus,
};
