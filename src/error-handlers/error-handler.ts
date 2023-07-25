function errorHandler(err: any, _: any, res: any, __: any) {
    console.error(err.customMessage, err);
    res.status(500).send({ error: err.customMessage });
}

export default errorHandler;
