const SocialNetwork = artifacts.require('./SocialNetwork.sol')

require('chai').use(require('chai-as-promised')).should()

contract('SocialNetwork' , ([deployer , author , tipper]) => {
    let socialNetwork

    before(async () =>{
        socialNetwork = await SocialNetwork.deployed()
    })

    describe('deployement' , async () => {
        it('deploys successfully' , async () =>{
            const address = await socialNetwork.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has Name' , async () =>{
            const name = await socialNetwork.name()
            assert.equal(name , "Social Network")
        })
    })

    describe('posts' , async () => {
        let results , postCount

        before(async () =>{
            results = await socialNetwork.createPost('This is my first Post' , {
                from : author
            })
            postCount = await socialNetwork.postCount()
        })

        it('create posts' , async () => {

          assert.equal(postCount , 1)
          const event = results.logs[0].args
          assert.equal(event.id.toNumber() , postCount.toNumber() , 'id is ok')
          assert.equal(event.content , 'This is my first Post' , 'content is ok')
          assert.equal(event.tipAmount , '0' , 'tip is ok')
          assert.equal(event.author , author , 'author is ok')

          await socialNetwork.createPost('' , {from : author}).should.be.rejected;
          
        })          

        it('list posts' , async ()=>{
            
            const post = await socialNetwork.posts(postCount)
            assert.equal(post.id.toNumber() , postCount.toNumber() , 'id is ok')
            assert.equal(post.content , 'This is my first Post' , 'content is ok')
            assert.equal(post.tipAmount , '0' , 'tip is ok')
            assert.equal(post.author , author , 'author is ok')
  
        })

        it('allow user to tip post' , async ()=>{

            let oldAuthorBalance
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

            
            results = await socialNetwork.tipPost(postCount , {
                from : tipper,
                value : web3.utils.toWei('1' , 'Ether')
            })

            const event = results.logs[0].args
            assert.equal(event.id.toNumber() , postCount.toNumber() , 'id is ok')
            assert.equal(event.content , 'This is my first Post' , 'content is ok')
            assert.equal(event.tipAmount , '1000000000000000000' , 'tip is ok')
            assert.equal(event.author , author , 'author is ok')

            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            let tipAmount
            tipAmount = web3.utils.toWei('1' , 'Ether')
            tipAmount = new web3.utils.BN(tipAmount)

            const expectedAmount = oldAuthorBalance.add(tipAmount)

            assert.equal(newAuthorBalance.toString(), expectedAmount.toString())

            await socialNetwork.tipPost(121334232 , {
                from : tipper,
                value : web3.utils.toWei('1' , 'Ether')
            }).should.be.rejected;

        })

    })
})