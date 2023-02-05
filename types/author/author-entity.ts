export interface AuthorEntity {
    olId:string,
    wikipedia: string,
    personal_name: {
        type: string,
    },
    key: string,

    alternate_names: {
        type: string,
    },
    links: string[],
    publish_date: string,
    name: string,
    birth_date: string,
    photos: [string],
    bio: string,
    last_modified: { type: string, value: Date },
}
