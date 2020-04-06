import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

//Add an endpoint to GET a specific resource by Primary Key
router.get('/:id', async(req: Request, res: Response) => {
    let {id} = req.params;
    console.log('id is ', id);
    if(!id){
        res.status(400).send("Id needs to be provided to process the request.");
    }

    try{
        const item = await FeedItem.findByPk(id);
        if(!item){
            res.status(404).send("Cannot find a feed with id = " + id);
        }
        res.status(200).send(item);
    }
    catch(e){
        console.error(e);
        res.status(500).send('Unable to handle the request.');
    }
      
});

// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        let {id} = req.params
        let patch = req.body
        console.log('id is ', id);
        console.log('patch is', patch);
        if(!id){
            res.status(400).send("Id needs to be provided to process the request.");
        }
    
        try{
            let item = await FeedItem.findByPk(id);
            if(!item){
                res.status(404).send("Cannot find a feed with id = " + id);
            }
            for( let key in patch){
                item.set(key, patch[key]) ;
            }
            item = await item.save();

            res.status(200).send(item);
        }
        catch(e){
            console.error(e);
            res.status(500).send('Unable to handle the request.');
        }
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;