# 딥러닝 모델 학습 방법
다음과 같은 순서로 실행하시면 됩니다. 

```
01_crop.py          : 한글 전체 이미지에서 글자 단위로 자르는 파일.

02_fot2image.py     : 학습을 하기 위한 손글씨-실제글씨의 pair 데이터 생성.

03.packge.py        : paier 데이터를 하나의 object 파일로 저장.

04.train.py         : DCGAN 모델 학습하는 파일.

05.infer.py         : 테스트 데이터를 사용해서 모델 성능 체크.
```
### 01_cropy.py
---
해당 파일의 코드를 보면 --src_dir라고 되어있는 부분이 있습니다. 

그 곳의 default라고 되어 있는 부분에서 `template이 있는 경로를 적어 주시면 됩니다.` 

예를 들어, '/home/dev/template' 이렇게 적어주시면 됩니다. 

나머지, --dst_dir, --txt도 마찬가지 입니다. 

만약, 코드를 cmd 창에서 실행을 하신다면 다음과 같이 적으시면 됩니다. 

```shell
pyhton 01_crop.py --src_dir=[템플릿 경로] --dst_dir=[crop될 이미지가 저장 될 경로] --txt=399-uniform.txt [399-uniform.txt가 있는 경로]
```

### 02_font2image.py
---
argparser에 있는 나머지 부분은 수정할 필요 없습니다. 

`sample_dir` 와 `handwriting_dir` 만 다음과 같이 수정하시면 됩니다. 

`sample_dir` : pair 데이터가 존재하는 경로, 예를 들어 /home/dev/fontpython/data/pair

`handwriting_dir`: crop.py에서 얻은 한글 글자들이 저장된 경로, 예를 들어 /home/dev/fontpython/data/handwriting

만약, 코드를 cmd 창에서 실행을 하신다면 다음과 같이 적으시면 됩니다. 
```shell
fontpython 02_font2image.py --sample_dir=[pair 데이터 경로] --handwriting_dir=[한글 글자들이 저장된 경로]
```

### 03.packge.py
---
argparser에 있는 나머지 부분은 수정할 필요 없습니다.

`dir`: pair데이터가 있는 경로, 예를 들어 /home/dev/fontpython/data/pair

`save_dir` : object 파일이 저장될 경로, 예를 들어 /home/dev/fontpython/data

만약, 코드를 cmd 창에서 실행을 하신다면 다음과 같이 적으시면 됩니다. 
```shell
fontpython 03_package.py --dir=[pair 데이터 경로] --save_dir=[object 파일이 저장된 경로]
```

### 04.train.py
---
argparse에서 다음만 수정하면 학습이 됩니다. 

`experimet_dir`: 학습된 모델이 저장될 경로입니다. 학습된 모델은 **checkpoint**라는 folder에 저장이 됩니다.

`experiment_id`: 학습하면서 저장되는 모델들을 구분하기 위해서 지정되는 숫자들이니 학습할 때마나 숫자를 바꿔주면 됩니다. 

학습하기 전에 **pretrained model**를 불러와서 학습을 진행해야 성능이 어느정도 나옵니다. 

pretrained model은 학습하고자 하는 폴더에 넣어주면 됩니다. 

예를 들어, 학습하고자 하는 디렉토리가 `checkpoint/experiment_1_batch_16` 이라하면 experiment_1_batch_16 이 폴더에 넣으시면 됩니다. 

**pretrained model**은 baseline_checkpoint/experiment_0_batch_16 에 있습니다. 이 폴더에 있는 
모든 파일을 복사해서 학습하고자 하는 폴더에 붙여넣기 하시면 됩니다. 


학습은 총 2번으로 진행됩니다. 
1. Pretrained model을 이용한 일반적인 학습
   * epoch          :30 (임의의 정한 값이라 사용자가 지정하면 됩니다.), 
   * batch_size     :16 (메모리 부족 에러가 없으면 16으로 유지하는 게 좋습니다.)
   * schedule       :20
   * L1_penalty     :100
   * Lconst_penalty :15
  
2. Fine-Tunnin: 1번 학습이 끝나고 아래와 같이 값을 수정 후 RUN 하시면 됩니다. 
   * epoch          :120
   * batch_size     :16 (메모리 부족 에러가 없으면 16으로 유지하는 게 좋습니다.)
   * schedule       :40
   * L1_penalty     :500
   * Lconst_penalty :1000

### 05.infer.py
---
학습된 모델을 불러와서 추론을 하시면 됩니다. 

1. `model_dir`: 학습된 모델이 저장된 디렉토리를 불러오면 됩니다. 예를 들어, 다음과 같습니다. 
   `/home/dev/fontpython/experiments/checkpoint/experiment_14_batch_8` 

2. `source_obj`: val.obj가 있는 디렉토리를 불러오면 됩니다. 예를 들어, 다음과 같습니다.
   `/home/dev/fontpython/data/val.obj`

3. `save_dir` : 추론된 결과인 손글씨 이미지가 저장될 디렉토리를 넣어주면 됩니다. 예를 들어, 다음과 같습니다.
   `/home/dev/FONT/experiment_14_batch_8/inferred_result`

4. `progress_file`: log 라는 폴더에 있는 학습된 폴더명을 불러오면 됩니다. 예를 들어 다음과 같습니다.
   `/home/dev/fontpython/experiments/logs/experiment_14_batch_8/progress`


# 개발환경
### 환경 설정 하기. 

도커 hub에서 tensorflow/tensorlfow:1.14.0-gpu-py3-jupyter 를 pull 받습니다. 

```shell
docker pull tensorflow/tensorflow:1.14.0-gpu-py3-jupyter
```

### Requiremets
```
Ubuntu 18.04
Nvidia GTX 1660 SUPER
CUDA 11.8
CUDNN 8.6.0
tensorflow 1.14.0
fontpython 3.7.x
```

# 참조
https://github.com/kaonashi-tyc/zi2zi<br>
https://github.com/periannath/neural-fonts<br>
https://github.com/yjjng11/Neural-fonts-webapp<br>