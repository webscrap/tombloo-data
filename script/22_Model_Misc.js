models.preprocess('GoogleBookmarks',1,1,1);
if(models.Twitpic) {
	models.preprocess('Twitpic',1,1,1);
	models.Twitpic.ICON = 'https://twitpic.com/favicon.ico';
	models.Twitpic.POST_URL = 'https://twitpic.com/upload';
}
models.preprocess('Twitter',1,0,1);
