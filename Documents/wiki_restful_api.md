# RESTful API

- Return format:
`{feedback: result, ...}` result is 'Success' or 'Failure'

- User 
	- get user information
		- `GET /users/<uid>`
		- return: {feedback:'..', user:..}
	- get self information
		- `GET /users/self`
		- return: {feedback:'..', user:..}
	- update user info
		- `PUT /users/update --data nickname=<nickname>&description=<description>&phone=<phone>&wechat=<wechat>&email=<email>&qq=<qq>&facebook=<facebook>`
		- return: {feedback:'..', user:..}
	- get items of me
		- `GET /users/self/items`
		- return: {feedback:'..', items:[..]}
	- get items of a user
		- `GET /users/<uid>/items`
		- return: {feedback:'..', items:[..]}
	- get all the users that have chat with me
		- `GET /users/contacts`
		- return: {feedback:'..', contacts:[..]} (contacts is a list of uid, e.g [1,2,3])
	
- Item
	- create a new item (**login** required)
		- `POST /items/create --data cid=<cid>&price=<price>&quantity=<quantity>&tags=[tags]&attributes={title:<title>, description:<description>, condition=<condition>, ...}` (`tags`,`attributes` are json)
	- get detail information of an item
		- `GET /items/<iid>`
		- notice: **different** from what it shows in `/showdbs`, the `cid` in the returned dict is actually a `category`, e.g: ... cid:{"name":"books","_id":"58e8d54d1a9a4056cf810714","sold":0} ...
	- update infomation of an item (**login** required)
		- `PUT /items/<iid> --data cid=<cid>&price=<price>&quantity=<quantity>&tags=[tags]&attributes={title:<title>, description:<description>, condition=<condition>, ...}` (`tags`,`attributes` are json)
	- delete an item (**login** required)
		- `DELETE /items/<iid>`
	- Upload new pictures for an item, support multiple pictures uploading, file type: `.jpg, .png, .jpeg` (**login** required) 
		- `POST	/items/<iid>/upload -F pic=@filename`
	- Delete a picture from a item (**login** required) 
		- `DELETE /items/<iid>/pictures/<p>`
	- show a picture
		- `GET /items/<iid>/pictures/<p>`
	- show a thumbnail
		- `GET /items/<iid>/thumbnails/<p>`
	- show comments
		- `GET /items/<iid>/comments`	(return: list of [uid, content, timestamp])
	- add comment (**login** required) 
		- `POST /items/<iid>/comments --data content=<content>`
	
- Category
	- get category list
		- `GET /categories` 
		- return: {feedback:'..',categories:[..]}
	- get items of one category
		- `GET /categories/<cid>/items` 
		- return: {feedback:'..', items:[..]} (the `cid` of each item here is a string)
- Follow
	- follow a user (**login** required)
		- `GET /follow/<uid>` 
		- return: {feedback:'..', follow:..}
	- unfollow a user (**login** required)
		- `GET /unfollow/<uid>` 
		- return: {feedback:'..'}
	- list followees (**login** required)
		- `GET /follow/followees`
		- return: {feedback:'..', followees:[..]} (followees is a list of uid)
	- list followers (**login** required)
		- `GET /follow/followers`
		- return: {feedback:'..', followers:[..]} (followers is a list of uid)
- Message
	- send message (**login** required)
		- `POST /messages/<uid> --data content=<content>`
		- return: {feedback:'..', message:message}
	- check new messages (**login** required)
		- `GET /users/new_messages`
		- return: {feedback:'..', msg_buf:[..]} (msg_buf is a list of sender uid)
	- get chat content with another user (**login** required)
		- `GET /messages/<uid>`
		- return: {feedback:'..', message:..}
- Transaction
	- get transaction info (**login** required)
		- `GET /transactions/<tid>`
		- return: {feedback: '..', transaction: ..}
	- send buy request (**login** required)
		- `POST /transactions/create --data iid=<iid>`
		- return: {feedback:'..', transaction: ..}
	- seller confirm the transaction (**login** required)
		- `GET /transactions/:tid/confirm`
		- return: {feedback:'..', transaction: ..}
	- receiver confirm the transaction (**login** required)
		- `GET /transactions/:tid/receive`
		- return: {feedback:'..', transaction: ..}
	- seller reject the transaction (**login** required)
		- `GET /transactions/:tid/reject`
		- return: {feedback:'..', transaction: ..}
	- buyer cancel the transaction (**login** required)
		- `GET /transactions/:tid/cancel`
		- return: {feedback:'..', transaction: ..}

- Search
	- search items using a keyword
		- basic use: `GET /search?keyword=<keyword>`
		- options:`minprice`,`maxprice`,`cid`,`tags`(`tags` is JSON), `page`(mininum is 0)
		- e.g `GET /search?keyword=<keyword>&minprice=50&tags=["good"]&page=1`
		- return: {feedback:'..', items: [..]} 

- Recommend
	- get some recommended items based on how popular a category is
		- `GET /recommends`
		- return: [..] (a list of items)
- Testing (only for testing use)
	- get all the database data
		- `GET /showdbs`
		- return: 
		```javascript
			{
			feedback:'..', 
		 	dbs:{
				user:[..],
				item:[..],
				category:[..],
				follow:[..],
				message:[..],
				transaction:[..]
			}} 
		```

