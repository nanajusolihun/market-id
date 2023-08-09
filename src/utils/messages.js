const messages = (res, code, message, data, pagination) => {
    let result = { code, message, data, pagination };
  
    res.status(code).send(result);
  };
  
  export default messages;