import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {
    //Get the main application
  useApp, 
    //A single frame in the update
  useFrame, 
    //activate function
  useActivate, 
   //Allows the main application to 'wear' the app
  useWear, 
  useUse, 
   //Get access to the player
  useLocalPlayer, 
    //THREE scene in the main application
  useScene, 
  getNextInstanceId, 
  useCleanup
  } =  metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default () => {
  const app = useApp();
  app.name = 'cube';

  const scene = useScene();

  (async () => {
    {
        let u2 = `${baseUrl}cube.glb`;
        if (/^https?:/.test(u2)) {
            u2 = '/@proxy/' + u2;
        }
        const m = await metaversefile.import(u2);
        cubeApp = metaversefile.createApp({
            name: u2,
        });
      
        const components = [
            {
            "key": "instanceId",
            "value": getNextInstanceId(),
            },
            {
            "key": "contentId",
            "value": u2,
            },
            {
            "key": "physics",
            "value": true, 
            }
        ];
      
        for (const {key, value} of components) {
            cubeApp.setComponent(key, value);
        }
        await cubeApp.addModule(m);
        var geometry = new THREE.PlaneGeometry (500, 500, 9, 9);
        var plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
        scene.add(cubeApp);

        cubeApp.addEventListener('use', e => {
        {
            cubeApp.scale.set(new Vector3(10,10,10));
        }
        });
    }
  })();
  
  app.getPhysicsObjects = () => {
    return cubeApp ? cubeApp.getPhysicsObjectsOriginal() : [];
  };
  
  useActivate(() => {
    const localPlayer = useLocalPlayer();
    localPlayer.wear(app);
  });
  
  let wearing = false;
  useWear(e => {
    const {wear} = e;
    wearing = wear;
  });
  
  useUse(() => {
    if (cubeApp) {
      cubeApp.use();
    }
  });
  //UPDATE
  useFrame(({timestamp}) => {
    if (!wearing) {
      if (cubeApp) {
        //
        cubeApp.position.copy(app.position);
        cubeApp.quaternion.copy(app.quaternion);
      }
    } else {
      if (cubeApp) {
        app.position.copy(cubeApp.position);
        app.quaternion.copy(cubeApp.quaternion);
      }
    }
  });
  
  useCleanup(() => {
    scene.remove(cubeApp)
  });

  return app;
};