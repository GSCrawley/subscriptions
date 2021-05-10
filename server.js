const { ApolloServer, gql, PubSub } = require('apollo-server');

const pubsub = new PubSub();

const typeDefs = gql`
	type Post {
		message: String!
		date: String!
	}

	type Channel {
        name: String!
        posts: [Post!]
    }

	type Query {
		posts(channel: String!): [Post!]
        channels: [Channel!]!
	}

	type Mutation {
		addPost(channel: String!, message: String!): Post
		addChannel(name: String!): Channel
	}

	type Subscription {
		newPost(channel: String!, message: String!): Post
		newChanel: Channel!
	}
`

const data = {
	Main: [ { message: 'Tnis is my main message, the obvious straightforward meaning of the words you hear coming out of my mouth', date: new Date() } ],
	Subtext: [ { message: 'This is the underlying subtext of my message, the hidden message hidden behind my message, that odds are you probably arent smart enough to be able to figure out', date: new Date() }]
}

const resolvers = {
	Query: {
		posts: () => {
			return data
		}
	},
	Mutation: {
        addPost: (_, { message }) => {
			const post = { message, date: new Date() }
			data.push(post)
			pubsub.publish('NEW_POST', { newPost: post }) // Publish!
			return post
		}
	},
	Subscription: {
		newPost: {
			subscribe: () => pubsub.asyncIterator('NEW_POST')
		}
	}
};

const server = new ApolloServer({ 
	typeDefs, 
	resolvers 
});

// The `listen` method launches a web server.e
server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});