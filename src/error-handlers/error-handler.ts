export function errorHandler(err: any, _: any, res: any, __: any) {
    console.error(err.customMessage, err);
    res.status(500).send({ error: err.customMessage });
}

export function pageNotFound(_: any, res: any, __: any) {
    console.error('page not found');
    res.status(404).send({ error: 'Page not found' });
}
