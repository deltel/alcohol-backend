export function errorHandler(err: any, _: any, res: any, __: any) {
    console.error(err);
    res.status(err.code).send({ message: err.message, errors: err.errors });
}

export function pageNotFound(_: any, res: any, __: any) {
    console.error('page not found');
    res.status(404).send({ message: 'Page not found' });
}
