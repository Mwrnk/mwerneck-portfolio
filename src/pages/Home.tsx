import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import earthTexture from '../assets/textures/earth-map-3.png';

const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer;
    let effect: AsciiEffect;
    let globe: THREE.Mesh;
    let controls: OrbitControls;

    // Guarda a referência ao container para uso na limpeza
    const container = containerRef.current;

    // Função de inicialização
    const init = () => {
      // Configuração da câmera
      camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 500;

      // Configuração da cena
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0, 0, 0);

      // Melhorando a iluminação
      // Luz ambiente mais clara para iluminação geral
      const ambientLight = new THREE.AmbientLight(0xcccccc, 0.8);
      scene.add(ambientLight);

      // Luz direcional principal (como o sol)
      const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(1, 0.5, 1).normalize();
      scene.add(mainLight);

      // Luz direcional suave de preenchimento do lado oposto
      const fillLight = new THREE.DirectionalLight(0x7777ff, 0.6);
      fillLight.position.set(-1, 0.5, -1).normalize();
      scene.add(fillLight);

      // Luz suave de baixo para cima para realçar detalhes
      const rimLight = new THREE.DirectionalLight(0xffffcc, 0.4);
      rimLight.position.set(0, -1, 0).normalize();
      scene.add(rimLight);

      // Carregando a textura do mapa-múndi
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(earthTexture);

      // Ajustando a textura para melhor visualização
      texture.anisotropy = 16;

      // Criando o globo terrestre
      const globeGeometry = new THREE.SphereGeometry(200, 64, 32);
      const globeMaterial = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 15,
        flatShading: false,
      });

      globe = new THREE.Mesh(globeGeometry, globeMaterial);
      // Inclinando o globo para simular a inclinação do eixo terrestre
      globe.rotation.x = Math.PI * 0.1;
      scene.add(globe);

      // Renderizador com anti-aliasing
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);

      // Efeito ASCII
      effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true, resolution: 0.175 });
      effect.setSize(container.clientWidth, container.clientHeight);
      effect.domElement.style.color = 'white';
      effect.domElement.style.backgroundColor = 'black';

      // Adiciona o elemento ao container
      container.appendChild(effect.domElement);

      // Usa OrbitControls para rotação com inércia
      controls = new OrbitControls(camera, effect.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableRotate = true;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.2;

      // Listener para redimensionamento da janela
      window.addEventListener('resize', onWindowResize);
    };

    // Função para ajustar o tamanho quando a janela é redimensionada
    const onWindowResize = () => {
      if (!container) return;

      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(container.clientWidth, container.clientHeight);
      effect.setSize(container.clientWidth, container.clientHeight);
    };

    // Função de animação
    const animate = () => {
      // Atualiza controles (inclui damping/inércia)
      controls.update();

      effect.render(scene, camera);
      requestAnimationFrame(animate);
    };

    // Inicializa e começa a animação
    init();
    animate();

    // Limpeza quando o componente é desmontado
    return () => {
      window.removeEventListener('resize', onWindowResize);
      controls.dispose();

      if (container && effect.domElement) {
        container.removeChild(effect.domElement);
      }
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold">Mateus Werneck.</h1>
      <h2 className="text-xl font-semibold">Software Engineer</h2>
      <div ref={containerRef} className="w-full h-[500px] overflow-hidden mt-6" />
    </div>
  );
};

export default Home;
