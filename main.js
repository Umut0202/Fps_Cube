// Üç boyutlu sahne oluşturuluyor.
var scene = new THREE.Scene();

// Perspektif kamerası oluşturuluyor. Parametreler sırasıyla:
// 1. İlk parametre, dikey görüş açısını temsil eder. Bu, sahnede görülebilen nesnelerin miktarını etkiler.
// 2. İkinci parametre, kameranın en-boy oranını ifade eder. Bu genellikle pencerenin en-boy oranıdır ve görüntülemenin boyutunu belirler.
// 3. Üçüncü parametre, kameranın ön kesit düzleminden uzaklığını ifade eder. Bu değer, nesnelerin ne kadar uzağa görülebileceğini belirler.
// 4. Dördüncü parametre, kameranın arka kesit düzleminden uzaklığını ifade eder. Bu değer, genellikle görüntülenen nesnelerin maksimum uzaklığını belirler.
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

var clock = new THREE.Clock();
var jump_can = 1;
var velocity_y = 0;

// Kameranın pozisyonu ayarlanıyor. "set" metodu, kameranın X, Y ve Z koordinatlarını belirlemek için kullanılır.
camera.position.set(9, 0.3, 3);

// Renderer Oluşturma:
// Renderer oluşturulur ve pencerenin boyutlarına göre ayarlanır. Renk ayarları ve diğer yapılandırmalar yapılır. Renderer'ın HTML dokümanına eklenmesi de sağlanır.
// WebGLRenderer nesnesi oluşturuluyor. Parametre olarak bir yapılandırma nesnesi geçirilebilir.
var renderer = new THREE.WebGLRenderer({ alpha: true, depth: true });

// Render ayarlarını yapılandırma
renderer.setPixelRatio(window.devicePixelRatio); // Piksel oranını ayarlar
renderer.setSize(window.innerWidth, window.innerHeight); // Render boyutunu pencere boyutuna ayarlar
renderer.toneMapping = THREE.ReinhardToneMapping; // Ton eşlemeyi THREE.ReinhardToneMapping olarak ayarlar
renderer.setClearColor(0x000000, 1); // Arka plan rengini siyah (0x000000) ve opak (1) olarak ayarlar
// DOM öğesinin stil özelliklerini düzenler
renderer.domElement.style.position = "fixed";
renderer.domElement.id = "renderer";
renderer.domElement.style.zIndex = "-1";
renderer.domElement.style.left = "0";
renderer.domElement.style.top = "0";
document.body.appendChild(renderer.domElement); // Renderer öğesini belgeye (document) ekler

var raycaster = new THREE.Raycaster(); // Yayıcı (raycaster) nesnesi oluşturuluyor. Bu, 3B uzayda ışınların nasıl hareket edeceğini tanımlamak için kullanılır.
var mouse = new THREE.Vector2(); // Mouse (fare) pozisyonunu temsil eden vektör nesnesi oluşturuluyor.
var particles = []; // Parçacıklar için bir dizi oluşturuluyor.
var triangles = []; // Üçgenler için bir dizi oluşturuluyor.
let cubes = []; // Küpler için bir dizi oluşturuluyor.

// Kübün daha önce hareket ettirilip ettirilmediğini takip eden bayrak
var hasCubeMoved = false;

//Yerçekimi etkisi için vektör değişkenleri
// Yerçekimi vektörü oluşturuluyor. Bu, sahnede yerçekimi etkisini simüle etmek için kullanılır.
var gravity = new THREE.Vector3(0, -0.01, 0); // Gerekli yerçekimi şiddetini ayarlayın. Bu, y ekseni boyunca aşağı doğru bir ivmeyi temsil eder, yani aşağı yönde bir yerçekimi kuvveti uygular.
var maxGravityDistance = 2; // Maksimum yerçekimi etkileşim mesafesi sabiti ayarlanıyor.

// PointerLockControls nesnesi oluşturuluyor. Bu, kullanıcının kameranın bakış açısını fare veya dokunmatik girişlerle kontrol etmesini sağlar.
var controls = new THREE.PointerLockControls(camera, document.body);

// GridHelper nesnesi oluşturuluyor. Bu, üç boyutlu sahnede bir ızgara oluşturmak için kullanılır. İlk parametre, ızgara boyutunu belirtir. İkinci parametre, ızgara bölümlerinin sayısını belirtir
var gridHelper = new THREE.GridHelper(20, 50);

// Oluşturulan ızgara yardımcısının malzemesinin rengi mor (0x800080) olarak ayarlanıyor.
gridHelper.material.color.set(0x800080);

// GridHelper'a sahneyi ekle
scene.add(gridHelper);

// Izgara ile aynı boyutta bir düzlem geometrisi oluştur
var planeGeometry = new THREE.PlaneGeometry(20, 50);

// MeshBasicMaterial nesnesi oluşturuluyor. Bu, temel düz renkli bir malzeme oluşturmak için kullanılır.
// "color" özelliği, malzemenin rengini belirler. Burada 0x0000ff, mavi rengin altı haneli heksadesimal değerini temsil eder.
// "side" özelliği, malzemenin iki taraflı olmasını sağlar, yani malzeme her iki tarafta da görünür olur.
var blueMaterial = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  side: THREE.DoubleSide,
});

// Mesh nesnesi oluşturuluyor. Bu, belirli bir geometri ve malzeme kombinasyonuyla üç boyutlu bir nesne oluşturur.
// "planeGeometry" değişkeni, düz bir düzlem geometrisini temsil eder.
// "blueMaterial" değişkeni, mavi renkteki temel malzemeyi temsil eder.
var planeMesh = new THREE.Mesh(planeGeometry, blueMaterial);
// Izgarayı 90 derece döndür
planeMesh.rotation.x = Math.PI / 2;
// Düzlüğün konumunu ızgara ile hizalamak için ayarla
planeMesh.position.copy(gridHelper.position);
scene.add(planeMesh);

// Bir küp oluştur
var geometry = new THREE.BoxGeometry(1, 1, 1); //(x,y,z)
// MeshBasicMaterial nesnesi oluşturuluyor. Bu, temel düz renkli bir malzeme oluşturmak için kullanılır.
// "color" özelliği, malzemenin rengini belirler. Burada 0x00ff00, yeşil rengin altı haneli heksadesimal değerini temsil eder.
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

//Sahneye 20 tane küp eklenir.
for (var i = 0; i < 20; i++) {
  var cube = new THREE.Mesh(geometry, material); // Yeni bir küp oluşturuluyor 'geometry' ve 'material' kullanılarak şekillendiriliyor.
  cube.position.set(0, 0.5, 0); // Küp pozisyonunu ızgaranın 0.5 birim üzerine ayarla
  scene.add(cube); // Sahneye oluşturulan küp ekleniyor.
  scene.add(cube); // Sahneye eklenen küpü tekrar sahneye eklemek, küpü aynı konumda iki kez eklemek anlamına gelir.
  cubes.push(cube); // 'cubes' dizisine oluşturulan küp ekleniyor.
}

// Kamerayı küp konumuna doğru ayarla
camera.lookAt(cube.position);

// PointerLockControls'u kur
var blocker = document.getElementById("blocker"); // 'blocker' adlı HTML öğesine erişim sağlanıyor.
var instructions = document.getElementById("instructions"); // 'instructions' adlı HTML öğesine erişim sağlanıyor.
var playButton = document.getElementById("playButton"); // 'playButton' adlı HTML öğesine erişim sağlanıyor.

// 'playButton' adlı HTML öğesine tıklama olayı dinleyicisi ekleniyor.
// Bu düğmeye tıklandığında, 'controls' nesnesi kilitlenir.
playButton.addEventListener("click", function () {
  controls.lock();
});

// Kilitlendiğinde yapılacakları belirle
// 'controls' nesnesine "kilit" olayı dinleyicisi ekleniyor.
// Bu olay gerçekleştiğinde, belirli HTML öğelerinin görünürlüğü değiştirilecek.
controls.addEventListener("lock", function () {
  instructions.style.display = "none"; // 'instructions' adlı HTML öğesinin görünürlüğü "none" (gizli) olarak ayarlanıyor.
  blocker.style.display = "none"; // 'blocker' adlı HTML öğesinin görünürlüğü "none" (gizli) olarak ayarlanıyor.
  document.getElementById("crosshair").style.display = "block"; // 'crosshair' adlı HTML öğesinin görünürlüğü "block" (görünür) olarak ayarlanıyor.
});

// Kilidi açıldığında yapılacakları belirle
// 'controls' nesnesine "unlock" olayı dinleyicisi ekleniyor.
// Bu olay gerçekleştiğinde, belirli HTML öğelerinin görünürlüğü değiştirilecektir.
controls.addEventListener("unlock", function () {
  blocker.style.display = "block"; // 'blocker' adlı HTML öğesinin görünürlüğü "block" (görünür) olarak ayarlanıyor.
  instructions.style.display = ""; // 'instructions' adlı HTML öğesinin görünürlüğü varsayılan ayarına döndürülüyor.
  document.getElementById("crosshair").style.display = "none"; // Ekran kilidi açıldığında crosshair'ı gizle
});

// 'controls' nesnesi içindeki nesne, sahneye ekleniyor.
scene.add(controls.getObject());

// Keyboard kontrolleri için değişkenler
var moveForward = false; // İleri hareket etmek için kullanılacak değişken
var moveBackward = false; // Geri hareket etmek için kullanılacak değişken
var moveLeft = false; // Sola hareket etmek için kullanılacak değişken
var moveRight = false; // Sağa hareket etmek için kullanılacak değişken

// Tuş basma olaylarını dinle
// 'onKeyDown' adlı bir işlev tanımlanıyor, bu işlev klavye girişlerine yanıt verir.
var onKeyDown = function (event) {
  switch (event.keyCode) {
    case 38: // yukarı ok
    case 87: // W tuşu
      moveForward = true; // İleri hareket etme durumu 'true' olarak ayarlanıyor.
      break;
    case 37: // sol ok
    case 65: // A tuşu
      moveLeft = true; // Sola hareket etme durumu 'true' olarak ayarlanıyor.
      break;
    case 40: // aşağı ok
    case 83: // S tuşu
      moveBackward = true; // Geri hareket etme durumu 'true' olarak ayarlanıyor.
      break;
    case 39: // sağ ok
    case 68: // D tuşu
      moveRight = true; // Sağa hareket etme durumu 'true' olarak ayarlanıyor.
      break;
    case 32:
      if (jump_can === 1) {
        jump_can = 0;
        velocity_y = 16;
      }
      break;
  }
};

// Tuş bırakma olayını dinle
// 'onKeyUp' adlı bir işlev tanımlanıyor, bu işlev klavye tuşları serbest bırakıldığında çalışır.
var onKeyUp = function (event) {
  switch (event.keyCode) {
    case 38: // yukarı ok
    case 87: // W tuşu
      moveForward = false;
      break;
    case 37: // sol ok
    case 65: // A tuşu
      moveLeft = false;
      break;
    case 40: // aşağı ok
    case 83: // S tuşu
      moveBackward = false;
      break;
    case 39: // sağ ok
    case 68: // D tuşu
      moveRight = false;
      break;
    case 32:
      if (jump_can == 0) {
        velocity_y -= 9.8 * 2 * delta;
        if (camera.position.y <= -0.5) {
          jump_can = 1;
          velocity_y = 0;
          camera.position.y = -0.5;
        }
      }
      break;
  }
};

// Klavye olaylarını dinle
document.addEventListener("keydown", onKeyDown); // 'keydown' olayı dinleyicisi ekleniyor, klavye tuşuna basıldığında 'onKeyDown' işlevi çağrılacak.
document.addEventListener("keyup", onKeyUp); // 'keyup' olayı dinleyicisi ekleniyor, klavye tuşu serbest bırakıldığında 'onKeyUp' işlevi çağrılacak.

// 'checkCollision' adlı bir fonksiyon tanımlanıyor, bu fonksiyon belirli bir konumda çarpışma olup olmadığını kontrol eder.
function checkCollision(position) {
  var gridSize = 20; // Izgara boyutunu belirler, bu durumda 20 birim.
  var halfGridSize = gridSize / 2; // Yarım ızgara boyutunu hesaplar.
  var margin = 0.1; // Kenar boşluğunu belirler.

  // Eğer pozisyon, belirli bir sınırdan daha dışarıda ise çarpışma tespit edilir.
  if (
    position.x < -halfGridSize + margin || // X ekseni sınırları kontrol edilir.
    position.x > halfGridSize - margin ||
    position.z < -halfGridSize + margin || // Z ekseni sınırları kontrol edilir.
    position.z > halfGridSize - margin
  ) {
    return true; // Çarpışma tespit edildi
  }

  return false; // Çarpışma tespit edilmedi.
}

// Render loop
function animate() {
  requestAnimationFrame(animate); // 'requestAnimationFrame' fonksiyonuyla animasyon döngüsü başlatılıyor.

  if (controls.getObject().position.y > 10) {
    velocity.add(gravity); // Yerçekimini karakterin hızına ekle
  }
  if (jump === true) {
    controls.getObject().position.y += velocity.y * 0.01; // Karakterin y eksenindeki pozisyonunu güncelle
    velocity.y -= 1; // Karakterin y eksenindeki hızını azalt
    if (controls.getObject().position.y <= 10) {
      // Eğer karakter yer seviyesindeyse
      jump = false; // Zıplama durumunu false yap
      controls.getObject().position.y = 10; // Karakterin y eksenindeki pozisyonunu yer seviyesine sabitle
      velocity.y = 0; // Karakterin y eksenindeki hızını sıfırla
    }
  }

  updateParticles(); // Parçacıkları güncelle.

  checkParticleCollision(); // Parçacık çarpışmalarını kontrol et.

  // Eğer kontroller kilitlenmişse, hareketi kontrol et.
  if (controls.isLocked) {
    var delta = 0.03;

    // İleri hareket etmek isteniyorsa, çarpışma kontrolü yapılır.
    if (moveForward) {
      controls.moveForward(delta);
      if (checkCollision(controls.getObject().position)) {
        controls.moveForward(-delta); // Önceki konuma geri dön.
      }
    }

    // Geri hareket etmek isteniyorsa, çarpışma kontrolü yapılır.
    if (moveBackward) {
      controls.moveForward(-delta);
      if (checkCollision(controls.getObject().position)) {
        controls.moveForward(delta); // Önceki konuma geri dön.
      }
    }

    // Sola hareket etmek isteniyorsa, çarpışma kontrolü yapılır.
    if (moveLeft) {
      controls.moveRight(-delta);
      if (checkCollision(controls.getObject().position)) {
        controls.moveRight(delta); // Önceki konuma geri dön.
      }
    }

    // Sağa hareket etmek isteniyorsa, çarpışma kontrolü yapılır.
    if (moveRight) {
      controls.moveRight(delta);
      if (checkCollision(controls.getObject().position)) {
        controls.moveRight(-delta); // Önceki konuma geri dön.
      }
    }

    if (jump_can === 0) {
      // Update the camera or object position accordingly
      camera.position.y += velocsity_y * delta;
      // Simulate the descent by adjusting the poition
      camera.position.y -= velocsity_y * delta;
    }
  }

  // Üçgenleri güncelle.
  updateTriangles();

  // Sahneyi ve kameraları renderla.
  renderer.render(scene, camera);
}

// 'animate' fonksiyonunu çağırarak animasyon döngüsünü başlat.
animate();

// 'removeParticle' adında bir fonksiyon tanımlanıyor, bu fonksiyon belirli bir parçacığı sahneden kaldırır.
function removeParticle(particle) {
  scene.remove(particle); // Belirtilen parçacığı sahneden kaldır.
  particles.splice(particles.indexOf(particle), 1); // 'particles' dizisinden belirtilen parçacığı çıkar.
}

// 'createParticle' adında bir fonksiyon tanımlanıyor, bu fonksiyon bir parçacık oluşturur.
function createParticle() {
  playLaserSound(); // 'playLaserSound()' işlevi çağrılarak bir ses çalınır.
  var geometry = new THREE.SphereGeometry(0.05, 16, 16); // Parçacık geometrisi ve malzemesi oluşturulur.
  var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  var particle = new THREE.Mesh(geometry, material);
  particle.position.copy(camera.position); // Parçacık oluşturulur ve kameranın pozisyonuna yerleştirilir.

  // Parçacığın başlangıç yönelimini ve hızını ayarla.
  particle.initialDirection = camera.getWorldDirection(new THREE.Vector3());
  particle.velocity = particle.initialDirection.clone().multiplyScalar(0.25);

  // Parçacığı sahneye ekle ve 'particles' dizisine ekle.
  scene.add(particle);
  particles.push(particle);
}

// 'updateParticles' adında bir fonksiyon tanımlanıyor, bu fonksiyon parçacıkları günceller.
function updateParticles() {
  var distanceThreshold = 20; // Belirli bir mesafe eşiğini tanımla.

  // Parçacıkların sayısını kontrol etmek için döngü oluştur.
  for (var i = particles.length - 1; i >= 0; i--) {
    var particle = particles[i];
    particle.position.add(particle.velocity); // Parçacığın konumunu hızına ekle.

    var distance = particle.position.distanceTo(camera.position); // Kameranın pozisyonuna olan mesafeyi hesapla.

    // Eğer mesafe belirlenen eşik değerinden büyükse, parçacığı kaldır.
    if (distance > distanceThreshold) {
      removeParticle(particle);
    }
  }
}

// 'onMouseDown' adında bir işlev tanımlanıyor ve 'event' parametresi alıyor.
function onMouseDown(event) {
  event.preventDefault(); // Tarayıcının varsayılan davranışını engelle.

  if (controls.isLocked) {
    // Kontroller kilidini açıkken sadece parçacık oluşturmaya izin verilir.
    if (event.button === 0) {
      createParticle(); //fare tıklamasının sol düğmesine yanıt verir. Eğer sol fare düğmesine tıklanmışsa, createParticle()  işlevi çağrılır.
    }
  }
}

function onMouseMove(event) {
  event.preventDefault(); // Tarayıcının varsayılan davranışını engelle.

  // Fare pozisyonunu normalleştirerek 'mouse' vektörünü güncelle.
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera); // 'raycaster'ı 'mouse' vektörü ve kamera kullanarak güncelle.
}

document.addEventListener("mousedown", onMouseDown); // Fare tıklama olayı için 'onMouseDown' işlevini dinle.
document.addEventListener("mousemove", onMouseMove, false); // Fare hareketi olayı için 'onMouseMove' işlevini dinle, olayı false olarak yakala.

var collidedParticles = 0; // Çarpışan parçacıkların sayısını tutar.

var hasCubeMoved = false; // Küpün zaten hareket ettirilip edilmediğini takip etmek için flag

// Parçacık ve küp çarpışmalarını kontrol eden fonksiyon
function checkParticleCollision() {
  // Tüm küpler için çarpışma kontrolü yap
  for (var j = 0; j < cubes.length; j++) {
    var cube = cubes[j];
    var isColliding = false; // Çarpışma durumunu takip etmek için bir bayrak

    // Küp görünürse
    if (cube.visible) {
      // Tüm parçacıklar için çarpışma kontrolü yap
      for (var i = 0; i < particles.length; i++) {
        var particle = particles[i];
        var particlePosition = particle.position;
        var particleEdge = particlePosition
          .clone()
          .add(particle.velocity.clone().normalize().multiplyScalar(0.1));
        // Raycasterı parçacık ve küp arasında konumlandır
        raycaster.set(
          particlePosition,
          particleEdge.sub(particlePosition).normalize()
        );
        var intersects = raycaster.intersectObject(cube);

        // Eğer çarpışma olursa
        if (intersects.length === 1) {
          isColliding = true; // Çarpışma durumunu belirle
          break;
        }
      }
    }

    // Çarpışma durumuna göre küp rengini ve görünürlüğünü ayarla
    if (isColliding) {
      // Çarpışma durumunda küp siyah olur
      cube.material.color.set(0x000000);
      explosion(cube); // Patlama efekti oluştur
      moveCubeRandomly(cube); // Küpü rastgele hareket ettir
      hasCubeMoved = false; // Küp gizlendiğinde bayrağı sıfırla
    } else {
      // Çarpışma olmadığında rasgele renk olur.
      var randomColor = Math.random() * 0xffffff; // Rastgele renk oluştur
      cube.material.color.set(randomColor); // Küpün rengini rastgele renge ayarla

      // Tüm parçacıklar kaldırıldıysa ve küp hareket etmediyse
      if (collidedParticles === particles.length && !hasCubeMoved) {
        collidedParticles = 0; // Çarpışan parçacıklar sayacını sıfırla
        hasCubeMoved = true; // Küpün hareket ettiğini belirtmek için bayrağı ayarla
      }
    }
  }
}

// verilen bir küpü rastgele bir konuma hareket ettirir
function moveCubeRandomly(cube) {
  var gridSize = 20; // İstenilen şekilde ızgara boyutunu ayarlayın
  var randomX = Math.floor(Math.random() * gridSize) - gridSize / 2; // Rasgele X konumu oluştur
  var randomZ = Math.floor(Math.random() * gridSize) - gridSize / 2; // Rasgele Z konumu oluştur

  cube.position.x = randomX; // Küpün X pozisyonunu rastgele X pozisyonuna ayarla
  cube.position.z = randomZ; // Küpün Z pozisyonunu rastgele Z pozisyonuna ayarla
}

// Küçük üçgenlerden bir patlama oluşturur
function explosion(cube) {
  playExplosionSound(); // Patlama sesini çal

  var explosionCount = 30; // Patlama sayısı

  for (var i = 0; i < explosionCount; i++) {
    var triangle = createTriangle(cube); // Üçgen oluştur ve küp ile ilişkilendir
    scene.add(triangle); // Üçgeni sahneye ekle
    triangles.push(triangle); // Üçgeni üçgenler dizisine ekle

    // Üçgenin hareket parametrelerini ve diğer özelliklerini ayarla
    triangle.userData = {
      direction: new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize(), // Rastgele bir yönlendirme vektörü oluştur ve normalize et
      speed: Math.random() * 0.05 + 0.01, // Rastgele hız belirle
      rotationAxis: new THREE.Vector3(
        Math.random(),
        Math.random(),
        Math.random()
      ).normalize(), // Rastgele bir dönüş eksen vektörü oluştur ve normalize et
      rotationSpeed: Math.random() * 0.1 + 0.005, // Rastgele dönüş hızı belirle
      distance: 0, // Üçgen tarafından kat edilen mesafeyi izle
      remove: false, // Üçgenin kaldırılıp kaldırılmayacağını belirlemek için bayrak
      parentCube: cube, // Çarpışan küpe referans ver
    };
  }
}

// küp etrafında bir üçgen oluşturur
function createTriangle(cube) {
  var geometry = new THREE.BufferGeometry(); // Yeni bir BufferGeometry oluştur
  var vertices = new Float32Array([-0.1, 0, 0, 0.1, 0, 0, 0, 0.1, 0]); // Üçgenin köşe noktalarını temsil eden bir Float32Array oluştur
  var indices = new Uint16Array([0, 1, 2]); // Üçgenin kenarlarını tanımlayan bir Uint16Array oluştur

  // Oluşturulan dizileri BufferAttribute olarak geometriye ata
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  // Sarı renkte ve çift taraflı renderlama özelliğine sahip yeni bir MeshBasicMaterial oluştur
  var material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide, // Her iki taraftan da görünmesini sağla
  });

  var triangle = new THREE.Mesh(geometry, material); // Geometri ve malzemeyi kullanarak yeni bir üçgen oluştur

  triangle.position.copy(cube.position); // Üçgenin başlangıç konumunu çarpışan küpün merkezine ayarla

  triangle.lookAt(camera.position); // Üçgenin kameraya doğru dönmesini sağla

  // Üçgenin ölçeğini rastgele bir değerle ayarla
  var scale = Math.random() * 1 + 0.5; // Ölçeklendirme aralığını belirle (0.5 ile 1.5 arasında)
  triangle.scale.set(scale, scale, scale);

  return triangle; // Oluşturulan üçgeni döndür
}

// Üçgenlerin konumlarını, dönüşlerini günceller ve gerektiğinde kaldırır
function updateTriangles() {
  // Her bir üçgen için güncelleme işlemlerini gerçekleştir
  for (var i = 0; i < triangles.length; i++) {
    var triangle = triangles[i];
    var userData = triangle.userData;

    var speed = userData.speed; // Üçgeni rastgele hızda yönde hareket ettir
    triangle.position.add(userData.direction.clone().multiplyScalar(speed));

    var rotationSpeed = userData.rotationSpeed; // Üçgenin rastgele hızda dönmesini sağlar
    triangle.rotateOnWorldAxis(userData.rotationAxis, rotationSpeed);

    userData.distance += speed; // Üçgen tarafından kat edilen mesafeyi güncelle

    // Eğer üçgen belirli bir mesafeyi kat ettiyse, kaldırılması için işaretle
    if (userData.distance >= 2) {
      userData.remove = true;
    }
  }

  // Kaldırılması işaretlenen üçgenleri kaldır
  for (var i = triangles.length - 1; i >= 0; i--) {
    if (triangles[i].userData.remove) {
      scene.remove(triangles[i]);
      triangles.splice(i, 1);
    }
  }

  // Pencere boyutu değiştiğinde render'ı yeniden boyutlandır
  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

var audioContext = null; // Ses bağlamını depolamak için değişken
var musicBuffer = null; // Müzik ses dosyasını depolamak için değişken
var laserSoundBuffer = null; // Lazer ses efektini depolamak için değişken
var explosionSoundBuffer = null; // Patlama ses efektini depolamak için değişken
var isMusicPlaying = false; // Müziğin çalınıp çalınmadığını belirten flag
var musicSource = null; // Müzik kaynağını depolamak için değişken

// Bu fonksiyon, belirtilen URL'den ses dosyasını yükler
function loadAudioFile(url, callback) {
  var request = new XMLHttpRequest(); // Yeni bir XMLHttpRequest oluştur
  request.open("GET", url, true); // Belirtilen URL'ye asenkron bir GET isteği gönder
  request.responseType = "arraybuffer"; // Yanıt tipini bir dizi tampona ayarla

  // İstek başarıyla tamamlandığında işlenecek olayı tanımla
  request.onload = function () {
    // audioContext aracılığıyla gelen veriyi ses verisine dönüştür
    audioContext.decodeAudioData(request.response, function (buffer) {
      // Dönüştürülen ses verisini geri çağırma işlevine aktar
      callback(buffer);
    });
  };

  request.send(); // İsteği gönder
}

// Müziğin çalması için fonksiyon
function playMusic() {
  // Eğer audioContext henüz tanımlanmamışsa, yeni bir AudioContext oluştur
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Eğer musicBuffer henüz yüklenmemişse, loadAudioFile fonksiyonu kullanılarak müzik dosyası yüklenir
  if (!musicBuffer) {
    loadAudioFile(
      "https://www.shane m/sounds/first-person-shooter-music.wav",
      function (buffer) {
        musicBuffer = buffer; // Yüklenen müzik dosyası buffer olarak atanır
        playLoopedSound(buffer, 0.35); // playLoopedSound fonksiyonu ile müzik çalınır
        isMusicPlaying = true; // Müzik çalındığı için isMusicPlaying bayrağı true olarak ayarlanır
      }
    );
  } else {
    // Eğer müzik çalınıyorsa, müzik duraklatılır
    if (isMusicPlaying) {
      pauseSound();
      isMusicPlaying = false;
      // Eğer müzik duraklatılmışsa, müzik devam ettirilir
    } else {
      resumeSound();
      isMusicPlaying = true;
    }
  }
}

// Belirli bir ses düzeyinde döngüde bir sesi çalmak için kullanılan fonksiyon
function playLoopedSound(buffer, volume) {
  musicSource = audioContext.createBufferSource(); // Ses kaynağı oluşturuluyor
  musicSource.buffer = buffer; // Oluşturulan ses kaynağına buffer ataması yapılıyor
  musicSource.loop = true; // Döngü modu etkinleştiriliyor
  var gainNode = audioContext.createGain(); // Gain düğümü oluşturuluyor
  gainNode.gain.setValueAtTime(0, audioContext.currentTime); // Başlangıçta ses düzeyi 0 olarak ayarlanıyor
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 2); // Ses düzeyi belirli bir sürede istenen düzeye yavaşça arttırılıyor (gerektiğinde zaman ayarlanabilir)
  musicSource.connect(gainNode); // Ses kaynağı ses düğümüne bağlanıyor
  gainNode.connect(audioContext.destination); // Ses düğümü ses çıkışına bağlanıyor

  // Ses kaynağının başlangıcı geciktiriliyor (gerektiğinde gecikme süresi ayarlanabilir)
  musicSource.start(audioContext.currentTime + 0.1);
}

// Müziği durdurmak için fonksiyon
function pauseSound() {
  if (musicSource) {
    musicSource.stop(); // Eğer musicSource değişkeni mevcutsa, ses kaynağı durdurulur.
    musicSource.disconnect(); // musicSource değişkeni bağlantıdan çıkarılır.
    musicSource = null; // Son olarak, musicSource değişkeni null olarak ayarlanır.
  }
}

// Müziği devam ettirmek için fonksiyon
function resumeSound() {
  // Eğer musicBuffer değişkeni mevcutsa, playLoopedSound fonksiyonu çağrılır.
  if (musicBuffer) {
    playLoopedSound(musicBuffer, 0.35); //(ses kaynağı verisi, sesin çalınma düzeyi)
  }
}

// Bu fonksiyon, lazer sesini çalmak için kullanılır. Öncelikle, bir AudioContext oluşturulur veya mevcut olan kullanılır.
// Daha sonra, eğer laserSoundBuffer henüz yüklenmemişse, loadAudioFile fonksiyonu kullanılarak ses dosyası yüklenir ve çalınır.
// Eğer zaten bir laserSoundBuffer varsa, playSound fonksiyonu kullanılarak ses çalınır.
function playLaserSound() {
  // Eğer audioContext henüz tanımlanmamışsa, yeni bir AudioContext oluşturulur.
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Eğer laserSoundBuffer henüz yüklenmemişse, belirtilen URL'den ses dosyası yüklenir ve çalınır.
  if (!laserSoundBuffer) {
    loadAudioFile(
      "https://www.shanebrumback.com/sounds/laser.wav",
      function (buffer) {
        // Yüklenen ses dosyası laserSoundBuffer değişkenine atanır.
        laserSoundBuffer = buffer;
        // playSound fonksiyonu kullanılarak ses çalınır. Ses çalma düzeyi 1 olarak belirlenmiştir.
        playSound(buffer, 1);
      }
    );
  } else {
    // Eğer laserSoundBuffer daha önce yüklenmişse, yüklenmiş olan buffer kullanılarak ses çalınır.
    playSound(laserSoundBuffer, 1);
  }
}

// Bu fonksiyon, patlama sesini çalmak için kullanılır.
function playExplosionSound() {
  // Eğer audioContext henüz tanımlanmamışsa, yeni bir AudioContext oluşturulur.
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Eğer explosionSoundBuffer henüz yüklenmemişse, belirtilen URL'den ses dosyası yüklenir ve çalınır.
  if (!explosionSoundBuffer) {
    // loadAudioFile fonksiyonu kullanılarak ses dosyası yüklenir ve buffer olarak alınır.
    loadAudioFile(
      "https://www.shanebrumback.com/sounds/explosion.wav",
      function (buffer) {
        // Yüklenen ses dosyası explosionSoundBuffer değişkenine atanır.
        explosionSoundBuffer = buffer;
        // playSound fonksiyonu kullanılarak ses çalınır. Ses çalma düzeyi 0.25 olarak belirlenmiştir.
        playSound(buffer, 0.25);
      }
    );
  } else {
    // Eğer explosionSoundBuffer daha önce yüklenmişse, mevcut olan buffer kullanılarak ses çalınır.
    playSound(explosionSoundBuffer, 0.25);
  }
}

// Bu fonksiyon, verilen buffer ve ses düzeyi ile ses çalmak için kullanılır.
function playSound(buffer, volume) {
  // Yeni bir BufferSource ve GainNode oluşturulur.
  var source = audioContext.createBufferSource();
  var gainNode = audioContext.createGain();
  // GainNode'un ses düzeyi belirlenen 'volume' değeriyle ayarlanır.
  gainNode.gain.value = volume;

  // Buffer kaynağı source'a atanır.
  source.buffer = buffer;
  // Ses kaynağı GainNode'a bağlanır.
  source.connect(gainNode);
  // GainNode ses çıkışı AudioContext.destination'a bağlanır.
  gainNode.connect(audioContext.destination);
  // Ses çalma işlemi başlatılır.
  source.start(0);
}
var velocity = new THREE.Vector3(); // Karakterin hızını saklayan bir vektör

var jump = false; // Zıplama durumu için bir bayrak

// Klavye olaylarını dinleyen bir event listener eklenir
document.addEventListener("keydown", function (event) {
  // Eğer tuş 'm' veya 'M' ise
  if (event.key === "m" || event.key === "M") {
    playMusic();
    // } else if (event.key === " ") {
    //   //zıplamak için
    //   if (jump === false) {
    //     velocity.y += 1;
    //     jump = true;
    //   }
    // Eğer tuş 'e' veya 'E' ise
  } else if (event.key === "e" || event.key === "E") {
    playExplosionSound(); // Patlama sesi çal
  }
});
