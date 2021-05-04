const { ApolloServer, gql, PubSub } = require('apollo-server');

const pubsub = new PubSub();

const typeDefs = gql`
	type Post {
		message: String!
		date: String!
	}

	type Query {
		posts: [Post!]!
	}

	type Mutation {
		addPost(message: String!): Post!
	}

	type Subscription {
		newPost: Post!
	}
`

const data = [
	{ message: 'hello world', date: new Date() }
]

const resolvers = {
	Query: {
		posts: () => {
			return data
		}
	},
	Mutation: {
        addPost: (parent, args, context, info) => {
            (_, { message }) => {
			const post = { message, date: new Date() }
			data.push(post)
			pubsub.publish('NEW_POST', { newPost: post }) // Publish!
			return post
		}
	},
	Subscription: {
		// Subscription types
	}
}

}