- signup
	- step0: validate user input information: username or email, one at a time
		- `POST /users/validate --data username=<username>` or `--data email=<email>`
	- step1: if information is valid, server will send an activation email to client, username should be `^[A-Za-z0-9_]{3,20}$`, email should be `^1155\d{6}@link\.cuhk\.edu.\hk$`, passworld should longer or equal than 8 charaters
		- `POST /users/register --data username=<username>&email=<email>&password=<password>`
	- step2: the client can click the link and then enter welcome page, note that the link will expire after 5 minutes

- login
	- `POST /users/login --data username=<username>&password=<password>` or `--data email=<email>&password=<password>`

- reset password
- logout