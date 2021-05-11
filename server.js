const { ApolloServer, gql, PubSub } = require('apollo-server');

const pubsub = new PubSub();

const data = [ {
	Main: [ 
		{ message: 'Tnis is my main message, the obvious straightforward meaning of the words you hear coming out of my mouth', date: new Date() } ],
	Subtext: [ 
		{ message: 'This is the underlying subtext of my message, the hidden message hidden behind my message, that odds are you probably arent smart enough to be able to figure out', date: new Date() },
	]
},
]

const typeDefs = gql`
	type Post {
		message: String!
		date: String!
	}

	type Channel {
        name: String!
        posts: [Post]
    }

	type Query {
		posts(channel: String!): [Post!]!
        channel: [Channel!]!
	}

    type Mutation {
		addPost(channel: String!, message: String!): Post
		addChannel(name: String!): Channel
	}

	type Subscription {
		newPost(channel: String!): Post
		newChannel: Channel!
	}
`

const resolvers = {
	Post: {
        message: (parent) => {
          return parent.message
        },
        date: (parent) => {
          return new Date(parent.date).toLocaleDateString()
        }
      },
	  Channel: {
        name: (parent) => {
          return parent.name
        },
        posts: (parent) => {
          return parent.posts
        } 
      },
	  Query: {
		  posts: (_, { channel }) => { 
			  return channel.filter(e => e.name === channel)[0].posts 
         },
        channel: () => { 
            return channel
        }
    },
	Mutation: {
        addPost: (_, { channel, message  }) => {
			            // console.log(message, channel)
            const post = { message, date: new Date() }
            const foundChannel = channels.find(i => i.name === channel)
			console.log(foundChannel)
			if (foundChannel === undefined){
                return null
            } 
			foundChannel.posts.push(post)
            pubsub.publish('NEW_POST', { newPost: post })
            return post
         },
		addChannel: (_, { name }) => {
            const channel = { 
				name, 
				posts: []
			}
            pubsub.publish('NEW_Channel', { newChannel: channel })
            return channel
        }
    },
	Subscription: {
        newPost: {
            subscribe: () => {
                pubsub.asyncIterator('NEW_POST')
            }
        },
        newChannel: {
            subscribe: () => pubsub.asyncIterator('NEW_Channel')
            }
        }
	}



const server = new ApolloServer({ 
	typeDefs, 
	resolvers 
});

// The `listen` method launches a web server.e
server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});