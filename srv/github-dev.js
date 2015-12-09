
var HOST = process.env.HOST || 'localhost'
var TOKEN = process.env.TOKEN || 'NO_TOKEN'

require('seneca')()

  .use('redis-transport')
  .use('level-store')

  .use('../github.js',{token:TOKEN})

  .add('role:info,req:part',function(args,done){
    done()

    this.act(
      'role:github,cmd:get',
      {name:args.name},

      function(err,mod){
        if( err ) return;

        if( mod ) {
          return this.act(
            'role:info,res:part,part:github',
            {name:args.name,data:mod.data$()})
        }

        this.act( 
          'role:npm,cmd:get', {name:args.name},
          function(err,mod){
            if( err ) return;

            if( mod ) {
              this.act(
                'role:github,cmd:get',
                {name:args.name,giturl:mod.giturl},
                function( err, mod ){
                  if( err ) return;

                  if( mod ) {
                    this.act('role:info,res:part,part:github',
                             {name:args.name,data:mod.data$()})
                  }
                })
            }
          })
      })
  })

  .use( 'mesh', {auto:true, pins:['role:info,req:part','role:github']} )

  .repl(33004)