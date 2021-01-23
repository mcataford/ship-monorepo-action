const schema = {
    type: 'object',
    properties: {
        projects: {
            type: 'object',
            patternProperties: {
                '[A-Za-z0-9_]': {
                    type: 'string',
                },
            },
        },
    },
    required: ['projects'],
}

export default schema
