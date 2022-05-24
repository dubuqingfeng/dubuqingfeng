## Quick Sort

快速排序

### 中心思想

分治

### 时间复杂度

### 各语言实现

go:

```
func quickSort(arr []int) []int {
        return _quickSort(arr, 0, len(arr)-1)
}

func _quickSort(arr []int, left, right int) []int {
        if left < right {
                partitionIndex := partition(arr, left, right)
                _quickSort(arr, left, partitionIndex-1)
                _quickSort(arr, partitionIndex+1, right)
        }
        return arr
}

func partition(arr []int, left, right int) int {
        pivot := left
        index := pivot + 1

        for i := index; i <= right; i++ {
                if arr[i] < arr[pivot] {
                        swap(arr, i, index)
                        index += 1
                }
        }
        swap(arr, pivot, index-1)
        return index - 1
}

func swap(arr []int, i, j int) {
        arr[i], arr[j] = arr[j], arr[i]
}
```

python:

```
def quickSort(arr, left=None, right=None):
    left = 0 if not isinstance(left,(int, float)) else left
    right = len(arr)-1 if not isinstance(right,(int, float)) else right
    if left < right:
        partitionIndex = partition(arr, left, right)
        quickSort(arr, left, partitionIndex-1)
        quickSort(arr, partitionIndex+1, right)
    return arr

def partition(arr, left, right):
    pivot = left
    index = pivot+1
    i = index
    while  i <= right:
        if arr[i] < arr[pivot]:
            swap(arr, i, index)
            index+=1
        i+=1
    swap(arr,pivot,index-1)
    return index-1

def swap(arr, i, j):
    arr[i], arr[j] = arr[j], arr[i]
```

php:

```
function quickSort($arr)
{
    if (count($arr) <= 1)
        return $arr;
    $middle = $arr[0];
    $leftArray = array();
    $rightArray = array();

    for ($i = 1; $i < count($arr); $i++) {
        if ($arr[$i] > $middle)
            $rightArray[] = $arr[$i];
        else
            $leftArray[] = $arr[$i];
    }
    $leftArray = quickSort($leftArray);
    $leftArray[] = $middle;

    $rightArray = quickSort($rightArray);
    return array_merge($leftArray, $rightArray);
}
```

### 参考链接

