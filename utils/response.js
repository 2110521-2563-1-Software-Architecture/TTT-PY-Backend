const responseSuccess = (statusCode, data = null, res) => {
  res.status(statusCode).json({
    status: "success",
    statusCode,
    data,
  });
};

const responseError = (statusCode, message, res) => {
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};

module.exports = { responseSuccess, responseError };
