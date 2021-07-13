const express = require('express');
const { graphqlHTTP } = require("express-graphql");
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');
const app = express();

const authors = [
    {id: 1, name: 'AC/DC'},
    {id: 2, name: 'Black Sabath'},
    {id: 3, name: 'Guns N\' Roses'},
];

const songs = [
    {id: 1, name: 'Back in Black', authorId: 1},
    {id: 2, name: 'Highway To Hell', authorId: 1},
    {id: 3, name: 'Thunderstruck', authorId: 1},
    {id: 4, name: 'Paranoid', authorId: 2},
    {id: 5, name: 'Iron Man', authorId: 2},
    {id: 6, name: 'Welcome to the jungle', authorId: 3},
    {id: 7, name: 'Paradise City', authorId: 3},
];

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'Single author',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLInt)
        },
        name: {
            type: GraphQLNonNull(GraphQLString)
        },
        songs: {
            type: GraphQLList(SongType),
            resolve: (parent) => songs.filter(song => song.authorId === parent.id)
        }
    })
});

const SongType = new GraphQLObjectType({
    name: 'Song',
    description: 'Single song',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLInt)
        },
        name: {
            type: GraphQLNonNull(GraphQLString)
        },
        authorId: {
            type: GraphQLNonNull(GraphQLInt)
        },
        author: {
            type: AuthorType,
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (parent) => authors.find(author => author.id === parent.authorId)
        }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root query',
    fields: () => ({
        song: {
            type: SongType,
            description: 'Single song',
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (parent, args) => songs.find(song => song.id === args.id)
        },

        songs: {
            type: new GraphQLList(SongType),
            description: 'List of songs',
            resolve: () => songs
        },

        author: {
            type: AuthorType,
            description: 'Single author',
            args: {
                id: {
                    type: GraphQLInt
                },
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },

        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of authors',
            resolve: () => authors
        }

    })
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root mutation',
    fields: () => ({
        addSong: {
            type: SongType,
            description: 'Add a songs',
            args: {                
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const newSong = {
                    id: songs.length + 1,
                    name: args.name,
                    authorId: args.authorId
                };
                songs.push(newSong);

                return newSong;
            }
        },

        addAuthor: {
            type: AuthorType,
            description: 'Add author',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)}
            },

            resolve: (parent, args) => {
                const newAuthor = {
                    id: authors.length + 1,
                    name: args.name
                };

                authors.push(newAuthor);

                return newAuthor;
            }
        }
    })
});

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});


app.use('/graphql', graphqlHTTP({
    graphiql: true,
    schema
}));
app.listen(5000, () => console.log('Running server')); 